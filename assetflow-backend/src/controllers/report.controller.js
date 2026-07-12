const Asset = require('../models/Asset.model');
const Maintenance = require('../models/Maintenance.model');
const Allocation = require('../models/Allocation.model');
const Booking = require('../models/Booking.model');
const Department = require('../models/Department.model');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { ASSET_STATUS, MAINTENANCE_STATUS } = require('../config/constants');

const getUtilizationReport = asyncHandler(async (req, res) => {
  const assets = await Asset.find().select('name assetTag status category department').populate('category', 'name').populate('department', 'name');
  const total = assets.length;
  const utilized = assets.filter((a) => a.status === ASSET_STATUS.ALLOCATED).length;
  const rate = total > 0 ? ((utilized / total) * 100).toFixed(2) : 0;
  res.json(new ApiResponse(200, { total, utilized, rate, assets }));
});

const getMaintenanceReport = asyncHandler(async (req, res) => {
  const records = await Maintenance.find().populate('asset', 'name assetTag').populate('requestedBy', 'name').populate('assignedTo', 'name');
  const byStatus = records.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {});
  const totalCost = records.reduce((sum, m) => sum + (m.actualCost || 0), 0);
  res.json(new ApiResponse(200, { records, byStatus, totalCost }));
});

const getDepartmentSummary = asyncHandler(async (req, res) => {
  const departments = await Department.find();
  const summary = await Promise.all(departments.map(async (dept) => {
    const assetCount = await Asset.countDocuments({ department: dept._id });
    const allocatedCount = await Asset.countDocuments({ department: dept._id, status: ASSET_STATUS.ALLOCATED });
    return { department: dept.name, total: assetCount, allocated: allocatedCount, available: assetCount - allocatedCount };
  }));
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
  const retired = await Asset.find({ status: ASSET_STATUS.RETIRED }).populate('category', 'name').populate('department', 'name');
  res.json(new ApiResponse(200, { total: retired.length, assets: retired }));
});

const exportReport = asyncHandler(async (req, res) => {
  const { type } = req.query;
  let data = [];
  if (type === 'assets') data = await Asset.find().populate('category department');
  if (type === 'allocations') data = await Allocation.find().populate('asset employee allocatedBy');
  if (type === 'maintenance') data = await Maintenance.find().populate('asset requestedBy assignedTo');
  res.json(new ApiResponse(200, data));
});

module.exports = { getUtilizationReport, getMaintenanceReport, getDepartmentSummary, getBookingHeatmap, getRetirementReport, exportReport };
