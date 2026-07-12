const Allocation = require('../models/Allocation.model');
const Asset = require('../models/Asset.model');
const Notification = require('../models/Notification.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');
const { ALLOCATION_STATUS, ASSET_STATUS } = require('../config/constants');

const getAllocations = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const result = await paginate(Allocation, query, { page: req.query.page, limit: req.query.limit, populate: [{ path: 'asset', select: 'name assetTag' }, { path: 'employee' }, { path: 'allocatedBy', select: 'name' }] });
  res.json(new ApiResponse(200, result));
});

const getAllocationById = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id).populate('asset').populate('employee').populate('allocatedBy', 'name email');
  if (!allocation) throw new ApiError(404, 'Allocation not found');
  res.json(new ApiResponse(200, allocation));
});

const createAllocation = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.body.asset);
  if (!asset) throw new ApiError(404, 'Asset not found');
  if (asset.status !== ASSET_STATUS.AVAILABLE) throw new ApiError(400, 'Asset is not available for allocation');
  const allocation = await Allocation.create({ ...req.body, allocatedBy: req.user._id });
  await Asset.findByIdAndUpdate(req.body.asset, { status: ASSET_STATUS.ALLOCATED, assignedTo: req.body.employee });
  await logActivity({ actor: req.user._id, action: 'Allocated asset', module: 'allocation', targetId: allocation._id });
  res.status(201).json(new ApiResponse(201, allocation, 'Asset allocated'));
});

const requestReturn = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id).populate('employee');
  if (!allocation) throw new ApiError(404, 'Allocation not found');
  if (allocation.status !== ALLOCATION_STATUS.ACTIVE) throw new ApiError(400, 'Allocation is not active');
  // Only the assigned employee or an admin/asset-manager can request a return
  const isAssignedEmployee = allocation.employee?._id?.toString() === req.user._id.toString();
  const isPrivileged = [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(req.user.role);
  if (!isAssignedEmployee && !isPrivileged) throw new ApiError(403, 'Not authorized to request return for this allocation');
  allocation.status = ALLOCATION_STATUS.RETURN_REQUESTED;
  await allocation.save();
  await Notification.create({ recipient: allocation.allocatedBy, type: 'return', title: 'Return Requested', message: 'An employee has requested asset return', linkedModule: 'allocation', linkedId: allocation._id });
  res.json(new ApiResponse(200, allocation, 'Return requested'));
});

const approveReturn = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id);
  if (!allocation) throw new ApiError(404, 'Allocation not found');
  if (allocation.status !== ALLOCATION_STATUS.RETURN_REQUESTED) throw new ApiError(400, 'Return has not been requested for this allocation');
  allocation.status = ALLOCATION_STATUS.RETURNED;
  allocation.returnedAt = new Date();
  allocation.returnApprovedBy = req.user._id;
  await allocation.save();
  await Asset.findByIdAndUpdate(allocation.asset, { status: ASSET_STATUS.AVAILABLE, assignedTo: null });
  await logActivity({ actor: req.user._id, action: 'Approved asset return', module: 'allocation', targetId: allocation._id });
  res.json(new ApiResponse(200, allocation, 'Return approved'));
});

const cancelAllocation = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id);
  if (!allocation) throw new ApiError(404, 'Allocation not found');
  if (allocation.status !== ALLOCATION_STATUS.ACTIVE) throw new ApiError(400, 'Only active allocations can be cancelled');
  allocation.status = ALLOCATION_STATUS.CANCELLED;
  await allocation.save();
  await Asset.findByIdAndUpdate(allocation.asset, { status: ASSET_STATUS.AVAILABLE, assignedTo: null });
  res.json(new ApiResponse(200, allocation, 'Allocation cancelled'));
});

module.exports = { getAllocations, getAllocationById, createAllocation, requestReturn, approveReturn, cancelAllocation };
