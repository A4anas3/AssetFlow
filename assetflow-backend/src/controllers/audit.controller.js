const Audit = require('../models/Audit.model');
const Asset = require('../models/Asset.model');
const Notification = require('../models/Notification.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');
const { AUDIT_STATUS, ASSET_STATUS, ROLES } = require('../config/constants');

const getAudits = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.department) query.department = req.query.department;
  const result = await paginate(Audit, query, {
    page: req.query.page,
    limit: req.query.limit,
    populate: [
      { path: 'department', select: 'name' },
      { path: 'auditors', select: 'name email' },
      { path: 'createdBy', select: 'name' },
    ],
  });
  res.json(new ApiResponse(200, result));
});

const getAuditById = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id)
    .populate('department')
    .populate('auditors', 'name email')
    .populate('createdBy', 'name')
    .populate('assets.asset')
    .populate('assets.verifiedBy', 'name');
  if (!audit) throw new ApiError(404, 'Audit not found');
  res.json(new ApiResponse(200, audit));
});

const createAudit = asyncHandler(async (req, res) => {
  // Collect all assets in scope (by department, optionally filtered by location)
  const assetQuery = { department: req.body.department };
  if (req.body.location) assetQuery.location = new RegExp(req.body.location, 'i');

  const assets = await Asset.find(assetQuery).select('_id');
  const auditAssets = assets.map((a) => ({ asset: a._id }));

  const audit = await Audit.create({
    ...req.body,
    createdBy: req.user._id,
    assets: auditAssets,
  });
  await logActivity({
    actor: req.user._id,
    action: 'Created audit',
    module: 'audit',
    targetId: audit._id,
  });
  res.status(201).json(new ApiResponse(201, audit, 'Audit created'));
});

// Spec: "Assign one or more auditors to the cycle"
const assignAuditors = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);
  if (!audit) throw new ApiError(404, 'Audit not found');
  if (audit.status === AUDIT_STATUS.CLOSED)
    throw new ApiError(400, 'Cannot assign auditors to a closed audit');

  // req.body.auditors = array of User IDs
  const auditorIds = req.body.auditors;
  if (!auditorIds || !Array.isArray(auditorIds) || auditorIds.length === 0)
    throw new ApiError(400, 'Provide at least one auditor');

  audit.auditors = auditorIds;
  audit.status = AUDIT_STATUS.IN_PROGRESS;
  await audit.save();

  // Notify each assigned auditor
  await Promise.all(
    auditorIds.map((auditorId) =>
      Notification.create({
        recipient: auditorId,
        type: 'audit',
        title: 'Audit Assignment',
        message: `You have been assigned to audit: "${audit.title}"`,
        linkedModule: 'audit',
        linkedId: audit._id,
      })
    )
  );

  const populated = await audit.populate('auditors', 'name email');
  res.json(new ApiResponse(200, populated, 'Auditors assigned'));
});

const verifyAsset = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);
  if (!audit) throw new ApiError(404, 'Audit not found');
  if (audit.status === AUDIT_STATUS.CLOSED)
    throw new ApiError(400, 'Cannot verify assets in a closed audit');

  // Only assigned auditors or admins can verify
  const isAuditor = audit.auditors.map((a) => a.toString()).includes(req.user._id.toString());
  const isPrivileged = [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(req.user.role);
  if (!isAuditor && !isPrivileged)
    throw new ApiError(403, 'Only assigned auditors can verify assets');

  const auditAsset = audit.assets.find((a) => a.asset.toString() === req.body.assetId);
  if (!auditAsset) throw new ApiError(404, 'Asset not found in this audit');

  auditAsset.verified = true;
  auditAsset.condition = req.body.condition || 'good';
  auditAsset.notes = req.body.notes || '';
  auditAsset.verifiedAt = new Date();
  auditAsset.verifiedBy = req.user._id;
  await audit.save();
  res.json(new ApiResponse(200, audit, 'Asset verified'));
});

// Spec: "Close Audit Cycle — locks the cycle and updates affected asset statuses
//        (e.g. Lost for confirmed-missing items, flag damaged)"
const closeAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id).populate('assets.asset');
  if (!audit) throw new ApiError(404, 'Audit not found');
  if (audit.status === AUDIT_STATUS.CLOSED) throw new ApiError(400, 'Audit is already closed');

  // Update asset statuses for flagged items
  const updatePromises = [];
  const notificationPromises = [];
  const discrepancies = { missing: [], damaged: [] };

  for (const auditAsset of audit.assets) {
    if (auditAsset.condition === 'missing') {
      // Confirmed missing → mark asset as LOST
      updatePromises.push(
        Asset.findByIdAndUpdate(auditAsset.asset._id, { status: ASSET_STATUS.LOST })
      );
      discrepancies.missing.push(auditAsset.asset);
    } else if (auditAsset.condition === 'damaged') {
      // Damaged → mark asset condition as poor
      updatePromises.push(
        Asset.findByIdAndUpdate(auditAsset.asset._id, { condition: 'poor' })
      );
      discrepancies.damaged.push(auditAsset.asset);
    }
  }

  // Notify audit creator about discrepancies
  if (discrepancies.missing.length > 0 || discrepancies.damaged.length > 0) {
    notificationPromises.push(
      Notification.create({
        recipient: audit.createdBy,
        type: 'audit',
        title: 'Audit Discrepancy Flagged',
        message: `Audit "${audit.title}" closed with ${discrepancies.missing.length} missing and ${discrepancies.damaged.length} damaged assets`,
        linkedModule: 'audit',
        linkedId: audit._id,
      })
    );
  }

  await Promise.all([...updatePromises, ...notificationPromises]);

  audit.status = AUDIT_STATUS.CLOSED;
  audit.closedAt = new Date();
  audit.summary = req.body.summary || '';
  await audit.save();

  await logActivity({
    actor: req.user._id,
    action: 'Closed audit',
    module: 'audit',
    targetId: audit._id,
  });
  res.json(
    new ApiResponse(200, { audit, discrepancies }, 'Audit closed and asset statuses updated')
  );
});

const getAuditReport = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id)
    .populate('department')
    .populate('auditors', 'name')
    .populate('assets.asset', 'name assetTag status condition');
  if (!audit) throw new ApiError(404, 'Audit not found');

  const total = audit.assets.length;
  const verified = audit.assets.filter((a) => a.verified).length;
  const missing = audit.assets.filter((a) => a.condition === 'missing').length;
  const damaged = audit.assets.filter((a) => a.condition === 'damaged').length;

  res.json(
    new ApiResponse(200, {
      audit,
      stats: { total, verified, missing, damaged, unverified: total - verified },
    })
  );
});

module.exports = {
  getAudits,
  getAuditById,
  createAudit,
  assignAuditors,
  verifyAsset,
  closeAudit,
  getAuditReport,
};
