const Asset = require('../models/Asset.model');
const Allocation = require('../models/Allocation.model');
const Maintenance = require('../models/Maintenance.model');
const ActivityLog = require('../models/ActivityLog.model');
const Notification = require('../models/Notification.model');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { ASSET_STATUS, MAINTENANCE_STATUS } = require('../config/constants');

const getStats = asyncHandler(async (req, res) => {
  const [totalAssets, availableAssets, allocatedAssets, inMaintenance, totalAllocations, pendingMaintenance] = await Promise.all([
    Asset.countDocuments(),
    Asset.countDocuments({ status: ASSET_STATUS.AVAILABLE }),
    Asset.countDocuments({ status: ASSET_STATUS.ALLOCATED }),
    Asset.countDocuments({ status: ASSET_STATUS.IN_MAINTENANCE }),
    Allocation.countDocuments({ status: 'active' }),
    Maintenance.countDocuments({ status: MAINTENANCE_STATUS.PENDING }),
  ]);
  res.json(new ApiResponse(200, { totalAssets, availableAssets, allocatedAssets, inMaintenance, totalAllocations, pendingMaintenance }));
});

const getRecentActivities = asyncHandler(async (req, res) => {
  const activities = await ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('actor', 'name email');
  res.json(new ApiResponse(200, activities));
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id, isRead: false }).sort({ createdAt: -1 }).limit(10);
  res.json(new ApiResponse(200, notifications));
});

const getKpis = asyncHandler(async (req, res) => {
  const totalAssets = await Asset.countDocuments();
  const utilizedAssets = await Asset.countDocuments({ status: { $in: [ASSET_STATUS.ALLOCATED, ASSET_STATUS.IN_MAINTENANCE] } });
  const utilizationRate = totalAssets > 0 ? ((utilizedAssets / totalAssets) * 100).toFixed(2) : 0;
  const resolvedMaintenance = await Maintenance.countDocuments({ status: MAINTENANCE_STATUS.RESOLVED });
  const totalMaintenance = await Maintenance.countDocuments();
  const maintenanceResolutionRate = totalMaintenance > 0 ? ((resolvedMaintenance / totalMaintenance) * 100).toFixed(2) : 0;
  res.json(new ApiResponse(200, { utilizationRate, maintenanceResolutionRate, totalAssets, utilizedAssets }));
});

module.exports = { getStats, getRecentActivities, getNotifications, getKpis };
