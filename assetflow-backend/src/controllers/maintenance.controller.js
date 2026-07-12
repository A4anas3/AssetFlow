const Maintenance = require('../models/Maintenance.model');
const Asset = require('../models/Asset.model');
const Notification = require('../models/Notification.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');
const { MAINTENANCE_STATUS, ASSET_STATUS, ROLES } = require('../config/constants');

const getMaintenanceRequests = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.asset) query.asset = req.query.asset;
  const result = await paginate(Maintenance, query, {
    page: req.query.page,
    limit: req.query.limit,
    populate: [
      { path: 'asset', select: 'name assetTag' },
      { path: 'requestedBy', select: 'name' },
      { path: 'assignedTo', select: 'name' },
    ],
  });
  res.json(new ApiResponse(200, result));
});

const getMaintenanceById = asyncHandler(async (req, res) => {
  const m = await Maintenance.findById(req.params.id)
    .populate('asset')
    .populate('requestedBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('approvedBy', 'name')
    .populate('rejectedBy', 'name');
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  res.json(new ApiResponse(200, m));
});

const createMaintenance = asyncHandler(async (req, res) => {
  // photos are uploaded separately via upload middleware and paths passed in req.body.photos
  const m = await Maintenance.create({ ...req.body, requestedBy: req.user._id });
  await logActivity({
    actor: req.user._id,
    action: 'Created maintenance request',
    module: 'maintenance',
    targetId: m._id,
  });
  res.status(201).json(new ApiResponse(201, m, 'Maintenance request created'));
});

const approveMaintenance = asyncHandler(async (req, res) => {
  const m = await Maintenance.findById(req.params.id);
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  if (m.status !== MAINTENANCE_STATUS.PENDING) throw new ApiError(400, 'Request is not pending');

  m.status = MAINTENANCE_STATUS.APPROVED;
  m.approvedBy = req.user._id;
  await m.save();
  await Asset.findByIdAndUpdate(m.asset, { status: ASSET_STATUS.IN_MAINTENANCE });

  // Spec: notify requester on approval
  await Notification.create({
    recipient: m.requestedBy,
    type: 'maintenance',
    title: 'Maintenance Approved',
    message: 'Your maintenance request has been approved',
    linkedModule: 'maintenance',
    linkedId: m._id,
  });

  res.json(new ApiResponse(200, m, 'Maintenance approved'));
});

const rejectMaintenance = asyncHandler(async (req, res) => {
  const m = await Maintenance.findById(req.params.id);
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  if (m.status !== MAINTENANCE_STATUS.PENDING) throw new ApiError(400, 'Request is not pending');

  m.status = MAINTENANCE_STATUS.REJECTED;
  m.rejectedBy = req.user._id;
  m.rejectedAt = new Date();
  m.rejectionReason = req.body.reason || '';
  await m.save();

  // Spec: notify requester on rejection
  await Notification.create({
    recipient: m.requestedBy,
    type: 'maintenance',
    title: 'Maintenance Rejected',
    message: req.body.reason || 'Your maintenance request has been rejected',
    linkedModule: 'maintenance',
    linkedId: m._id,
  });

  res.json(new ApiResponse(200, m, 'Maintenance rejected'));
});

const assignMaintenance = asyncHandler(async (req, res) => {
  const m = await Maintenance.findById(req.params.id);
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  // Can only assign on approved or previously assigned requests
  if (![MAINTENANCE_STATUS.APPROVED, MAINTENANCE_STATUS.ASSIGNED].includes(m.status))
    throw new ApiError(400, 'Only approved maintenance can be assigned to a technician');

  m.assignedTo = req.body.assignedTo;
  m.status = MAINTENANCE_STATUS.ASSIGNED;
  await m.save();

  // Spec: notify the assigned technician
  await Notification.create({
    recipient: req.body.assignedTo,
    type: 'maintenance',
    title: 'Maintenance Task Assigned',
    message: 'You have been assigned a maintenance task',
    linkedModule: 'maintenance',
    linkedId: m._id,
  });

  res.json(new ApiResponse(200, m, 'Technician assigned'));
});

const startMaintenance = asyncHandler(async (req, res) => {
  const m = await Maintenance.findById(req.params.id);
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  if (m.status !== MAINTENANCE_STATUS.ASSIGNED)
    throw new ApiError(400, 'Maintenance must be assigned before it can be started');

  // Only the assigned technician or admin/asset_manager can start
  const isAssigned = m.assignedTo?.toString() === req.user._id.toString();
  const isPrivileged = [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(req.user.role);
  if (!isAssigned && !isPrivileged)
    throw new ApiError(403, 'Only the assigned technician can start maintenance');

  m.status = MAINTENANCE_STATUS.IN_PROGRESS;
  m.startedAt = new Date();
  await m.save();
  res.json(new ApiResponse(200, m, 'Maintenance started'));
});

const resolveMaintenance = asyncHandler(async (req, res) => {
  const m = await Maintenance.findById(req.params.id);
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  if (m.status !== MAINTENANCE_STATUS.IN_PROGRESS)
    throw new ApiError(400, 'Maintenance must be in progress before it can be resolved');

  const isAssigned = m.assignedTo?.toString() === req.user._id.toString();
  const isPrivileged = [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(req.user.role);
  if (!isAssigned && !isPrivileged)
    throw new ApiError(403, 'Only the assigned technician can resolve maintenance');

  m.status = MAINTENANCE_STATUS.RESOLVED;
  m.resolvedAt = new Date();
  m.actualCost = req.body.actualCost || m.actualCost;
  m.notes = req.body.notes || m.notes;
  await m.save();

  // Spec: "asset status auto-updates back to Available on resolution"
  await Asset.findByIdAndUpdate(m.asset, { status: ASSET_STATUS.AVAILABLE });

  // Notify requester that maintenance is resolved
  await Notification.create({
    recipient: m.requestedBy,
    type: 'maintenance',
    title: 'Maintenance Resolved',
    message: 'Your maintenance request has been resolved and the asset is now available',
    linkedModule: 'maintenance',
    linkedId: m._id,
  });

  await logActivity({
    actor: req.user._id,
    action: 'Resolved maintenance',
    module: 'maintenance',
    targetId: m._id,
  });
  res.json(new ApiResponse(200, m, 'Maintenance resolved'));
});

module.exports = {
  getMaintenanceRequests,
  getMaintenanceById,
  createMaintenance,
  approveMaintenance,
  rejectMaintenance,
  assignMaintenance,
  startMaintenance,
  resolveMaintenance,
};
