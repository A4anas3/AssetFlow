const Maintenance = require('../models/Maintenance.model');
const Asset = require('../models/Asset.model');
const Notification = require('../models/Notification.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');
const { MAINTENANCE_STATUS, ASSET_STATUS } = require('../config/constants');

const getMaintenanceRequests = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  const result = await paginate(Maintenance, query, { page: req.query.page, limit: req.query.limit, populate: [{ path: 'asset', select: 'name assetTag' }, { path: 'requestedBy', select: 'name' }, { path: 'assignedTo', select: 'name' }] });
  res.json(new ApiResponse(200, result));
});

const getMaintenanceById = asyncHandler(async (req, res) => {
  const m = await Maintenance.findById(req.params.id).populate('asset').populate('requestedBy', 'name email').populate('assignedTo', 'name email').populate('approvedBy', 'name');
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  res.json(new ApiResponse(200, m));
});

const createMaintenance = asyncHandler(async (req, res) => {
  const m = await Maintenance.create({ ...req.body, requestedBy: req.user._id });
  await logActivity({ actor: req.user._id, action: 'Created maintenance request', module: 'maintenance', targetId: m._id });
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
  res.json(new ApiResponse(200, m, 'Maintenance approved'));
});

const rejectMaintenance = asyncHandler(async (req, res) => {
  const m = await Maintenance.findById(req.params.id);
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  if (m.status !== MAINTENANCE_STATUS.PENDING) throw new ApiError(400, 'Request is not pending');
  m.status = MAINTENANCE_STATUS.REJECTED;
  m.rejectionReason = req.body.reason || '';
  await m.save();
  res.json(new ApiResponse(200, m, 'Maintenance rejected'));
});

const assignMaintenance = asyncHandler(async (req, res) => {
  const m = await Maintenance.findByIdAndUpdate(req.params.id, { assignedTo: req.body.assignedTo, status: MAINTENANCE_STATUS.ASSIGNED }, { new: true });
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  res.json(new ApiResponse(200, m, 'Technician assigned'));
});

const startMaintenance = asyncHandler(async (req, res) => {
  const m = await Maintenance.findById(req.params.id);
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  m.status = MAINTENANCE_STATUS.IN_PROGRESS;
  m.startedAt = new Date();
  await m.save();
  res.json(new ApiResponse(200, m, 'Maintenance started'));
});

const resolveMaintenance = asyncHandler(async (req, res) => {
  const m = await Maintenance.findById(req.params.id);
  if (!m) throw new ApiError(404, 'Maintenance request not found');
  m.status = MAINTENANCE_STATUS.RESOLVED;
  m.resolvedAt = new Date();
  m.actualCost = req.body.actualCost || m.actualCost;
  m.notes = req.body.notes || m.notes;
  await m.save();
  await Asset.findByIdAndUpdate(m.asset, { status: ASSET_STATUS.AVAILABLE });
  await logActivity({ actor: req.user._id, action: 'Resolved maintenance', module: 'maintenance', targetId: m._id });
  res.json(new ApiResponse(200, m, 'Maintenance resolved'));
});

module.exports = { getMaintenanceRequests, getMaintenanceById, createMaintenance, approveMaintenance, rejectMaintenance, assignMaintenance, startMaintenance, resolveMaintenance };
