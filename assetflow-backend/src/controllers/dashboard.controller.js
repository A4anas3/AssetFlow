const Asset = require('../models/Asset.model');
const Allocation = require('../models/Allocation.model');
const Maintenance = require('../models/Maintenance.model');
const Transfer = require('../models/Transfer.model');
const Booking = require('../models/Booking.model');
const ActivityLog = require('../models/ActivityLog.model');
const Notification = require('../models/Notification.model');
const { ApiResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { ASSET_STATUS, MAINTENANCE_STATUS, ALLOCATION_STATUS, TRANSFER_STATUS, BOOKING_STATUS } = require('../config/constants');

// KPI cards per spec:
// Assets Available, Assets Allocated, Maintenance Today,
// Active Bookings, Pending Transfers, Upcoming Returns, Overdue Returns
const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  // 7-day window for "upcoming" returns
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    totalAssets,
    availableAssets,
    allocatedAssets,
    inMaintenance,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    upcomingReturns,
    overdueReturns,
    pendingMaintenance,
  ] = await Promise.all([
    Asset.countDocuments(),
    Asset.countDocuments({ status: ASSET_STATUS.AVAILABLE }),
    Asset.countDocuments({ status: ASSET_STATUS.ALLOCATED }),
    Asset.countDocuments({ status: ASSET_STATUS.IN_MAINTENANCE }),
    // Maintenance requests created or updated today
    Maintenance.countDocuments({
      status: { $in: [MAINTENANCE_STATUS.PENDING, MAINTENANCE_STATUS.IN_PROGRESS] },
      updatedAt: { $gte: todayStart, $lte: todayEnd },
    }),
    // Bookings currently ongoing or upcoming (startTime is in the future or already started)
    Booking.countDocuments({
      status: { $in: [BOOKING_STATUS.UPCOMING, BOOKING_STATUS.ONGOING] },
      endTime: { $gt: now },
    }),
    Transfer.countDocuments({ status: TRANSFER_STATUS.PENDING }),
    // Upcoming returns: active allocations with expectedReturnDate in next 7 days
    Allocation.countDocuments({
      status: ALLOCATION_STATUS.ACTIVE,
      expectedReturnDate: { $gte: now, $lte: sevenDaysFromNow },
    }),
    // Overdue: active allocations past their expected return date
    Allocation.countDocuments({
      status: ALLOCATION_STATUS.ACTIVE,
      expectedReturnDate: { $lt: now },
    }),
    Maintenance.countDocuments({ status: MAINTENANCE_STATUS.PENDING }),
  ]);

  res.json(
    new ApiResponse(200, {
      totalAssets,
      availableAssets,
      allocatedAssets,
      inMaintenance,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns,
      pendingMaintenance,
    })
  );
});

const getRecentActivities = asyncHandler(async (req, res) => {
  const activities = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('actor', 'name email');
  res.json(new ApiResponse(200, activities));
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id, isRead: false })
    .sort({ createdAt: -1 })
    .limit(10);
  res.json(new ApiResponse(200, notifications));
});

// Overdue allocations list for dashboard highlighting
const getOverdueAllocations = asyncHandler(async (req, res) => {
  const now = new Date();
  const overdue = await Allocation.find({
    status: ALLOCATION_STATUS.ACTIVE,
    expectedReturnDate: { $lt: now },
  })
    .sort({ expectedReturnDate: 1 })
    .populate('asset', 'name assetTag')
    .populate('employee', 'designation')
    .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } });
  res.json(new ApiResponse(200, { total: overdue.length, allocations: overdue }));
});

const getKpis = asyncHandler(async (req, res) => {
  const totalAssets = await Asset.countDocuments();
  const utilizedAssets = await Asset.countDocuments({
    status: { $in: [ASSET_STATUS.ALLOCATED, ASSET_STATUS.IN_MAINTENANCE] },
  });
  const utilizationRate = totalAssets > 0 ? ((utilizedAssets / totalAssets) * 100).toFixed(2) : 0;
  const resolvedMaintenance = await Maintenance.countDocuments({ status: MAINTENANCE_STATUS.RESOLVED });
  const totalMaintenance = await Maintenance.countDocuments();
  const maintenanceResolutionRate =
    totalMaintenance > 0 ? ((resolvedMaintenance / totalMaintenance) * 100).toFixed(2) : 0;
  res.json(
    new ApiResponse(200, { utilizationRate, maintenanceResolutionRate, totalAssets, utilizedAssets })
  );
});

module.exports = { getStats, getRecentActivities, getNotifications, getOverdueAllocations, getKpis };
