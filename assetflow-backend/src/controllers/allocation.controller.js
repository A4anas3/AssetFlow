const Asset = require('../models/Asset.model');
const Allocation = require('../models/Allocation.model');
const Maintenance = require('../models/Maintenance.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');
const { ALLOCATION_STATUS, ASSET_STATUS } = require('../config/constants');

const getAllocations = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.asset) query.asset = req.query.asset;
  if (req.query.employee) query.employee = req.query.employee;

  // Overdue filter
  if (req.query.overdue === 'true') {
    query.status = ALLOCATION_STATUS.ACTIVE;
    query.expectedReturnDate = { $lt: new Date() };
  }

  const result = await paginate(Allocation, query, {
    page: req.query.page,
    limit: req.query.limit,
    populate: [
      { path: 'asset', select: 'name assetTag status condition' },
      { path: 'employee', populate: { path: 'user', select: 'name email avatar' } },
      { path: 'allocatedBy', select: 'name' },
    ],
  });
  res.json(new ApiResponse(200, result));
});

const getAllocationById = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id)
    .populate('asset')
    .populate({ path: 'employee', populate: { path: 'user', select: 'name email avatar' } })
    .populate('allocatedBy', 'name email')
    .populate('returnApprovedBy', 'name');
  if (!allocation) throw new ApiError(404, 'Allocation not found');
  res.json(new ApiResponse(200, allocation));
});

const createAllocation = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.body.asset).populate('assignedTo');
  if (!asset) throw new ApiError(404, 'Asset not found');

  if (asset.status !== ASSET_STATUS.AVAILABLE) {
    // Spec: "currently held by X, offers Transfer Request button"
    // Return rich info so frontend can display who holds the asset
    let holderInfo = null;
    if (asset.assignedTo) {
      const Allocation = require('../models/Allocation.model');
      const activeAlloc = await Allocation.findOne({
        asset: asset._id,
        status: ALLOCATION_STATUS.ACTIVE,
      }).populate({ path: 'employee', populate: { path: 'user', select: 'name email' } });

      if (activeAlloc?.employee?.user) {
        holderInfo = {
          employeeId: activeAlloc.employee._id,
          name: activeAlloc.employee.user.name,
          email: activeAlloc.employee.user.email,
          allocationId: activeAlloc._id,
        };
      }
    }
    throw new ApiError(409, 'Asset is not available for allocation', [
      {
        code: 'ASSET_UNAVAILABLE',
        assetStatus: asset.status,
        currentHolder: holderInfo,
        suggestion: holderInfo ? 'RAISE_TRANSFER_REQUEST' : null,
      },
    ]);
  }

  const allocation = await Allocation.create({ ...req.body, allocatedBy: req.user._id });
  await Asset.findByIdAndUpdate(req.body.asset, {
    status: ASSET_STATUS.ALLOCATED,
    assignedTo: req.body.employee,
  });
  await logActivity({
    actor: req.user._id,
    action: 'Allocated asset',
    module: 'allocation',
    targetId: allocation._id,
  });
  res.status(201).json(new ApiResponse(201, allocation, 'Asset allocated'));
});

const requestReturn = asyncHandler(async (req, res) => {
  const { ROLES } = require('../config/constants');
  const Notification = require('../models/Notification.model');

  const allocation = await Allocation.findById(req.params.id).populate('employee');
  if (!allocation) throw new ApiError(404, 'Allocation not found');
  if (allocation.status !== ALLOCATION_STATUS.ACTIVE)
    throw new ApiError(400, 'Allocation is not active');

  const isAssignedEmployee =
    allocation.employee?._id?.toString() === req.user._id.toString() ||
    allocation.employee?.user?.toString() === req.user._id.toString();
  const isPrivileged = [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(req.user.role);
  if (!isAssignedEmployee && !isPrivileged)
    throw new ApiError(403, 'Not authorized to request return for this allocation');

  allocation.status = ALLOCATION_STATUS.RETURN_REQUESTED;
  await allocation.save();
  await Notification.create({
    recipient: allocation.allocatedBy,
    type: 'return',
    title: 'Return Requested',
    message: 'An employee has requested asset return',
    linkedModule: 'allocation',
    linkedId: allocation._id,
  });
  res.json(new ApiResponse(200, allocation, 'Return requested'));
});

const approveReturn = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id);
  if (!allocation) throw new ApiError(404, 'Allocation not found');
  if (allocation.status !== ALLOCATION_STATUS.RETURN_REQUESTED)
    throw new ApiError(400, 'Return has not been requested for this allocation');

  allocation.status = ALLOCATION_STATUS.RETURNED;
  allocation.returnedAt = new Date();
  allocation.returnApprovedBy = req.user._id;
  // Spec: capture condition check-in notes on return
  if (req.body.conditionOnReturn) allocation.conditionOnReturn = req.body.conditionOnReturn;
  if (req.body.returnNotes) allocation.returnNotes = req.body.returnNotes;
  await allocation.save();

  // Update asset — condition from return check-in if provided
  const assetUpdate = { status: ASSET_STATUS.AVAILABLE, assignedTo: null };
  if (req.body.conditionOnReturn) assetUpdate.condition = req.body.conditionOnReturn;
  await Asset.findByIdAndUpdate(allocation.asset, assetUpdate);

  await logActivity({
    actor: req.user._id,
    action: 'Approved asset return',
    module: 'allocation',
    targetId: allocation._id,
  });
  res.json(new ApiResponse(200, allocation, 'Return approved'));
});

const cancelAllocation = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id);
  if (!allocation) throw new ApiError(404, 'Allocation not found');
  if (allocation.status !== ALLOCATION_STATUS.ACTIVE)
    throw new ApiError(400, 'Only active allocations can be cancelled');
  allocation.status = ALLOCATION_STATUS.CANCELLED;
  await allocation.save();
  await Asset.findByIdAndUpdate(allocation.asset, { status: ASSET_STATUS.AVAILABLE, assignedTo: null });
  res.json(new ApiResponse(200, allocation, 'Allocation cancelled'));
});

module.exports = {
  getAllocations,
  getAllocationById,
  createAllocation,
  requestReturn,
  approveReturn,
  cancelAllocation,
};
