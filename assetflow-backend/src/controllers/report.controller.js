const Asset = require('../models/Asset.model');
const Maintenance = require('../models/Maintenance.model');
const Allocation = require('../models/Allocation.model');
const Booking = require('../models/Booking.model');
const Department = require('../models/Department.model');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { ASSET_STATUS, MAINTENANCE_STATUS, ALLOCATION_STATUS } = require('../config/constants');

const getUtilizationReport = asyncHandler(async (req, res) => {
  const assets = await Asset.find()
    .select('name assetTag status category department')
    .populate('category', 'name')
    .populate('department', 'name');
  const total = assets.length;
  const utilized = assets.filter((a) => a.status === ASSET_STATUS.ALLOCATED).length;
  const rate = total > 0 ? ((utilized / total) * 100).toFixed(2) : 0;
  res.json(new ApiResponse(200, { total, utilized, rate, assets }));
});

const getMaintenanceReport = asyncHandler(async (req, res) => {
  const records = await Maintenance.find()
    .populate('asset', 'name assetTag')
    .populate('requestedBy', 'name')
    .populate('assignedTo', 'name');
  const byStatus = records.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});
  const totalCost = records.reduce((sum, m) => sum + (m.actualCost || 0), 0);
  res.json(new ApiResponse(200, { records, byStatus, totalCost }));
});

// Spec: "Maintenance frequency by asset/category"
const getMaintenanceFrequency = asyncHandler(async (req, res) => {
  const byAsset = await Maintenance.aggregate([
    {
      $group: {
        _id: '$asset',
        count: { $sum: 1 },
        totalCost: { $sum: '$actualCost' },
        lastMaintenance: { $max: '$createdAt' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'assets',
        localField: '_id',
        foreignField: '_id',
        as: 'asset',
      },
    },
    { $unwind: { path: '$asset', preserveNullAndEmpty: true } },
    {
      $project: {
        count: 1,
        totalCost: 1,
        lastMaintenance: 1,
        'asset.name': 1,
        'asset.assetTag': 1,
      },
    },
  ]);

  const byCategory = await Maintenance.aggregate([
    {
      $lookup: {
        from: 'assets',
        localField: 'asset',
        foreignField: '_id',
        as: 'assetDoc',
      },
    },
    { $unwind: '$assetDoc' },
    {
      $group: {
        _id: '$assetDoc.category',
        count: { $sum: 1 },
        totalCost: { $sum: '$actualCost' },
      },
    },
    { $sort: { count: -1 } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmpty: true } },
    { $project: { count: 1, totalCost: 1, 'category.name': 1 } },
  ]);

  res.json(new ApiResponse(200, { byAsset, byCategory }));
});

const getDepartmentSummary = asyncHandler(async (req, res) => {
  // Use aggregation to avoid N+1 queries
  const summary = await Asset.aggregate([
    {
      $group: {
        _id: '$department',
        total: { $sum: 1 },
        allocated: {
          $sum: { $cond: [{ $eq: ['$status', ASSET_STATUS.ALLOCATED] }, 1, 0] },
        },
        inMaintenance: {
          $sum: { $cond: [{ $eq: ['$status', ASSET_STATUS.IN_MAINTENANCE] }, 1, 0] },
        },
        available: {
          $sum: { $cond: [{ $eq: ['$status', ASSET_STATUS.AVAILABLE] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: { path: '$department', preserveNullAndEmpty: true } },
    {
      $project: {
        total: 1,
        allocated: 1,
        inMaintenance: 1,
        available: 1,
        'department.name': 1,
        'department.code': 1,
      },
    },
    { $sort: { 'department.name': 1 } },
  ]);
  res.json(new ApiResponse(200, summary));
});

const getBookingHeatmap = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().select('startTime endTime resource status');
  const heatmap = bookings.reduce((acc, b) => {
    const day = new Date(b.startTime).toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  res.json(new ApiResponse(200, heatmap));
});

const getRetirementReport = asyncHandler(async (req, res) => {
  const retired = await Asset.find({ status: ASSET_STATUS.RETIRED })
    .populate('category', 'name')
    .populate('department', 'name');
  res.json(new ApiResponse(200, { total: retired.length, assets: retired }));
});

// Spec: "Assets due for maintenance or nearing retirement"
const getAssetsNearingRetirement = asyncHandler(async (req, res) => {
  const thresholdDays = parseInt(req.query.days) || 90;
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + thresholdDays);

  // Assets with warranty expiring within threshold
  const warrantyExpiring = await Asset.find({
    warrantyExpiry: { $lte: thresholdDate, $gte: new Date() },
    status: { $ne: ASSET_STATUS.RETIRED },
  })
    .populate('category', 'name')
    .populate('department', 'name')
    .sort({ warrantyExpiry: 1 });

  // Assets already retired
  const retired = await Asset.find({ status: ASSET_STATUS.RETIRED })
    .populate('category', 'name')
    .populate('department', 'name');

  res.json(
    new ApiResponse(200, {
      warrantyExpiring,
      retired,
      thresholdDays,
    })
  );
});

// Spec: "Overdue returns" — active allocations past expectedReturnDate
const getOverdueAllocationsReport = asyncHandler(async (req, res) => {
  const now = new Date();
  const overdue = await Allocation.find({
    status: ALLOCATION_STATUS.ACTIVE,
    expectedReturnDate: { $lt: now },
  })
    .sort({ expectedReturnDate: 1 })
    .populate('asset', 'name assetTag department')
    .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
    .populate('allocatedBy', 'name');

  const daysOverdue = overdue.map((a) => ({
    ...a.toObject(),
    daysOverdue: Math.floor((now - new Date(a.expectedReturnDate)) / (1000 * 60 * 60 * 24)),
  }));

  res.json(new ApiResponse(200, { total: overdue.length, allocations: daysOverdue }));
});

// Spec: exportable reports — with limit to prevent memory crash
const exportReport = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const EXPORT_LIMIT = 1000;
  let data = [];

  if (type === 'assets') {
    data = await Asset.find().populate('category department').limit(EXPORT_LIMIT);
  } else if (type === 'allocations') {
    data = await Allocation.find().populate('asset employee allocatedBy').limit(EXPORT_LIMIT);
  } else if (type === 'maintenance') {
    data = await Maintenance.find().populate('asset requestedBy assignedTo').limit(EXPORT_LIMIT);
  } else if (type === 'bookings') {
    data = await Booking.find().populate('resource bookedBy').limit(EXPORT_LIMIT);
  } else {
    return res.status(400).json({ success: false, message: 'Invalid export type. Use: assets, allocations, maintenance, bookings' });
  }

  res.json(new ApiResponse(200, { total: data.length, data }));
});

module.exports = {
  getUtilizationReport,
  getMaintenanceReport,
  getMaintenanceFrequency,
  getDepartmentSummary,
  getBookingHeatmap,
  getRetirementReport,
  getAssetsNearingRetirement,
  getOverdueAllocationsReport,
  exportReport,
};
