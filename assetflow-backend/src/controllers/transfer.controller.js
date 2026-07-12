const Transfer = require('../models/Transfer.model');
const Asset = require('../models/Asset.model');
const Notification = require('../models/Notification.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');
const { TRANSFER_STATUS } = require('../config/constants');

const getTransfers = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const result = await paginate(Transfer, query, { page: req.query.page, limit: req.query.limit, populate: [{ path: 'asset', select: 'name assetTag' }, { path: 'fromDepartment', select: 'name' }, { path: 'toDepartment', select: 'name' }, { path: 'requestedBy', select: 'name' }] });
  res.json(new ApiResponse(200, result));
});

const getTransferById = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id).populate('asset').populate('fromDepartment').populate('toDepartment').populate('requestedBy', 'name email').populate('approvedBy', 'name email');
  if (!transfer) throw new ApiError(404, 'Transfer not found');
  res.json(new ApiResponse(200, transfer));
});

const createTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.create({ ...req.body, requestedBy: req.user._id });
  await logActivity({ actor: req.user._id, action: 'Created transfer request', module: 'transfer', targetId: transfer._id });
  res.status(201).json(new ApiResponse(201, transfer, 'Transfer request created'));
});

const approveTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);
  if (!transfer) throw new ApiError(404, 'Transfer not found');
  if (transfer.status !== TRANSFER_STATUS.PENDING) throw new ApiError(400, 'Transfer is not pending');
  transfer.status = TRANSFER_STATUS.APPROVED;
  transfer.approvedBy = req.user._id;
  transfer.approvedAt = new Date();
  await transfer.save();
  await Asset.findByIdAndUpdate(transfer.asset, { department: transfer.toDepartment });
  await logActivity({ actor: req.user._id, action: 'Approved transfer', module: 'transfer', targetId: transfer._id });
  res.json(new ApiResponse(200, transfer, 'Transfer approved'));
});

const rejectTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);
  if (!transfer) throw new ApiError(404, 'Transfer not found');
  if (transfer.status !== TRANSFER_STATUS.PENDING) throw new ApiError(400, 'Transfer is not pending');
  transfer.status = TRANSFER_STATUS.REJECTED;
  transfer.rejectedBy = req.user._id;
  transfer.rejectionReason = req.body.rejectionReason || '';
  await transfer.save();
  res.json(new ApiResponse(200, transfer, 'Transfer rejected'));
});

const cancelTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);
  if (!transfer) throw new ApiError(404, 'Transfer not found');
  if (transfer.status !== TRANSFER_STATUS.PENDING) throw new ApiError(400, 'Only pending transfers can be cancelled');
  // Only the original requester or an admin/asset-manager can cancel
  const isRequester = transfer.requestedBy.toString() === req.user._id.toString();
  const isPrivileged = [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(req.user.role);
  if (!isRequester && !isPrivileged) throw new ApiError(403, 'Not authorized to cancel this transfer');
  transfer.status = TRANSFER_STATUS.CANCELLED;
  await transfer.save();
  res.json(new ApiResponse(200, transfer, 'Transfer cancelled'));
});

module.exports = { getTransfers, getTransferById, createTransfer, approveTransfer, rejectTransfer, cancelTransfer };
