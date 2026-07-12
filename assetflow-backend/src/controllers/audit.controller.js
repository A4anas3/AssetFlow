const Audit = require('../models/Audit.model');
const Asset = require('../models/Asset.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');
const { AUDIT_STATUS } = require('../config/constants');

const getAudits = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const result = await paginate(Audit, query, { page: req.query.page, limit: req.query.limit, populate: [{ path: 'department', select: 'name' }, { path: 'auditor', select: 'name email' }, { path: 'createdBy', select: 'name' }] });
  res.json(new ApiResponse(200, result));
});

const getAuditById = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id).populate('department').populate('auditor', 'name email').populate('createdBy', 'name').populate('assets.asset');
  if (!audit) throw new ApiError(404, 'Audit not found');
  res.json(new ApiResponse(200, audit));
});

const createAudit = asyncHandler(async (req, res) => {
  const assets = await Asset.find({ department: req.body.department }).select('_id');
  const auditAssets = assets.map((a) => ({ asset: a._id }));
  const audit = await Audit.create({ ...req.body, createdBy: req.user._id, assets: auditAssets });
  await logActivity({ actor: req.user._id, action: 'Created audit', module: 'audit', targetId: audit._id });
  res.status(201).json(new ApiResponse(201, audit, 'Audit created'));
});

const assignAuditor = asyncHandler(async (req, res) => {
  const audit = await Audit.findByIdAndUpdate(req.params.id, { auditor: req.body.auditor, status: AUDIT_STATUS.IN_PROGRESS }, { new: true });
  if (!audit) throw new ApiError(404, 'Audit not found');
  res.json(new ApiResponse(200, audit, 'Auditor assigned'));
});

const verifyAsset = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);
  if (!audit) throw new ApiError(404, 'Audit not found');
  const auditAsset = audit.assets.find((a) => a.asset.toString() === req.body.assetId);
  if (!auditAsset) throw new ApiError(404, 'Asset not found in this audit');
  auditAsset.verified = true;
  auditAsset.condition = req.body.condition || 'good';
  auditAsset.notes = req.body.notes || '';
  auditAsset.verifiedAt = new Date();
  await audit.save();
  res.json(new ApiResponse(200, audit, 'Asset verified'));
});

const closeAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);
  if (!audit) throw new ApiError(404, 'Audit not found');
  audit.status = AUDIT_STATUS.CLOSED;
  audit.closedAt = new Date();
  audit.summary = req.body.summary || '';
  await audit.save();
  await logActivity({ actor: req.user._id, action: 'Closed audit', module: 'audit', targetId: audit._id });
  res.json(new ApiResponse(200, audit, 'Audit closed'));
});

const getAuditReport = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id).populate('department').populate('auditor', 'name').populate('assets.asset', 'name assetTag status');
  if (!audit) throw new ApiError(404, 'Audit not found');
  const total = audit.assets.length;
  const verified = audit.assets.filter((a) => a.verified).length;
  const missing = audit.assets.filter((a) => a.condition === 'missing').length;
  const damaged = audit.assets.filter((a) => a.condition === 'damaged').length;
  res.json(new ApiResponse(200, { audit, stats: { total, verified, missing, damaged, unverified: total - verified } }));
});

module.exports = { getAudits, getAuditById, createAudit, assignAuditor, verifyAsset, closeAudit, getAuditReport };
