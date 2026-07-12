const Transfer = require('../models/Transfer.model');
const Asset = require('../models/Asset.model');
const Allocation = require('../models/Allocation.model');
const Notification = require('../models/Notification.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');
const { TRANSFER_STATUS, ASSET_STATUS, ALLOCATION_STATUS, ROLES } = require('../config/constants');

const getTransfers = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const result = await paginate(Transfer, query, {
    page: req.query.page,
    limit: req.query.limit,
    populate: [
      { path: 'asset', select: 'name assetTag' },
      { path: 'fromDepartment', select: 'name' },
      { path: 'toDepartment', select: 'name' },
      { path: 'toEmployee', populate: { path: 'user', select: 'name email' } },
      { path: 'requestedBy', select: 'name' },
    ],
  });
  res.json(new ApiResponse(200, result));
});

const getTransferById = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id)
    .populate('asset')
    .populate('fromDepartment')
    .populate('toDepartment')
    .populate({ path: 'toEmployee', populate: { path: 'user', select: 'name email' } })
    .populate('requestedBy', 'name email')
    .populate('approvedBy', 'name email')
    .populate('rejectedBy', 'name email');
  if (!transfer) throw new ApiError(404, 'Transfer not found');
  res.json(new ApiResponse(200, transfer));
});

const createTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.create({ ...req.body, requestedBy: req.user._id });
  await logActivity({
    actor: req.user._id,
    action: 'Created transfer request',
    module: 'transfer',
    targetId: transfer._id,
  });
  res.status(201).json(new ApiResponse(201, transfer, 'Transfer request created'));
});

// Spec: "Requested → Approved → Re-allocated (history updated automatically)"
const approveTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);
  if (!transfer) throw new ApiError(404, 'Transfer not found');
  if (transfer.status !== TRANSFER_STATUS.PENDING)
    throw new ApiError(400, 'Transfer is not pending');

  transfer.status = TRANSFER_STATUS.APPROVED;
  transfer.approvedBy = req.user._id;
  transfer.approvedAt = new Date();
  await transfer.save();

  // 1. Close the existing active allocation (mark as TRANSFERRED)
  const existingAllocation = await Allocation.findOneAndUpdate(
    { asset: transfer.asset, status: ALLOCATION_STATUS.ACTIVE },
    {
      status: ALLOCATION_STATUS.TRANSFERRED,
      returnedAt: new Date(),
      returnApprovedBy: req.user._id,
      returnNotes: `Transferred to ${transfer.toDepartment} via transfer request`,
    },
    { new: true }
  );

  // 2. Update asset department
  await Asset.findByIdAndUpdate(transfer.asset, { department: transfer.toDepartment });

  // 3. If toEmployee specified — create a new allocation record
  if (transfer.toEmployee) {
    const newAllocation = await Allocation.create({
      asset: transfer.asset,
      employee: transfer.toEmployee,
      allocatedBy: req.user._id,
      notes: `Re-allocated via transfer approval #${transfer._id}`,
    });
    if (existingAllocation) {
      existingAllocation.transferredTo = newAllocation._id;
      await existingAllocation.save();
    }
    await Asset.findByIdAndUpdate(transfer.asset, {
      status: ASSET_STATUS.ALLOCATED,
      assignedTo: transfer.toEmployee,
    });
  } else {
    // No specific employee → asset becomes available in new dept
    await Asset.findByIdAndUpdate(transfer.asset, {
      status: ASSET_STATUS.AVAILABLE,
      assignedTo: null,
    });
  }

  // Notify the original requester
  await Notification.create({
    recipient: transfer.requestedBy,
    type: 'transfer',
    title: 'Transfer Approved',
    message: 'Your asset transfer request has been approved and the asset has been re-allocated',
    linkedModule: 'transfer',
    linkedId: transfer._id,
  });

  await logActivity({
    actor: req.user._id,
    action: 'Approved transfer',
    module: 'transfer',
    targetId: transfer._id,
  });
  res.json(new ApiResponse(200, transfer, 'Transfer approved and asset re-allocated'));
});

const rejectTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);
  if (!transfer) throw new ApiError(404, 'Transfer not found');
  if (transfer.status !== TRANSFER_STATUS.PENDING)
    throw new ApiError(400, 'Transfer is not pending');

  transfer.status = TRANSFER_STATUS.REJECTED;
  transfer.rejectedBy = req.user._id;
  transfer.rejectedAt = new Date();
  transfer.rejectionReason = req.body.rejectionReason || '';
  await transfer.save();

  // Notify the requester of rejection
  await Notification.create({
    recipient: transfer.requestedBy,
    type: 'transfer',
    title: 'Transfer Rejected',
    message: req.body.rejectionReason || 'Your asset transfer request has been rejected',
    linkedModule: 'transfer',
    linkedId: transfer._id,
  });

  res.json(new ApiResponse(200, transfer, 'Transfer rejected'));
});

const cancelTransfer = asyncHandler(async (req, res) => {
  const transfer = await Transfer.findById(req.params.id);
  if (!transfer) throw new ApiError(404, 'Transfer not found');
  if (transfer.status !== TRANSFER_STATUS.PENDING)
    throw new ApiError(400, 'Only pending transfers can be cancelled');

  const isRequester = transfer.requestedBy.toString() === req.user._id.toString();
  const isPrivileged = [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(req.user.role);
  if (!isRequester && !isPrivileged)
    throw new ApiError(403, 'Not authorized to cancel this transfer');

  transfer.status = TRANSFER_STATUS.CANCELLED;
  await transfer.save();
  res.json(new ApiResponse(200, transfer, 'Transfer cancelled'));
});

module.exports = {
  getTransfers,
  getTransferById,
  createTransfer,
  approveTransfer,
  rejectTransfer,
  cancelTransfer,
};
