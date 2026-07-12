const express = require('express');
const router = express.Router();
const {
  getAudits,
  getAuditById,
  createAudit,
  assignAuditors,
  verifyAsset,
  closeAudit,
  getAuditReport,
} = require('../controllers/audit.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { auditValidator } = require('../validators/audit.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', getAudits);
router.get('/:id', getAuditById);
router.get('/:id/report', getAuditReport);
router.post('/', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), validate(auditValidator), createAudit);
// Updated: assignAuditors (array) — was assignAuditor (single)
router.patch('/:id/assign-auditors', authorize(ROLES.ADMIN), assignAuditors);
// Authorization now enforced inside verifyAsset controller (auditor-only)
router.patch('/:id/verify-asset', verifyAsset);
router.patch('/:id/close', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), closeAudit);

module.exports = router;
