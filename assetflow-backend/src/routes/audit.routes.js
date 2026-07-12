const express = require('express');
const router = express.Router();
const { getAudits, getAuditById, createAudit, assignAuditor, verifyAsset, closeAudit, getAuditReport } = require('../controllers/audit.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { auditValidator } = require('../validators/audit.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', getAudits);
router.get('/:id', getAuditById);
router.get('/:id/report', getAuditReport);
router.post('/', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), validate(auditValidator), createAudit);
router.patch('/:id/assign-auditor', authorize(ROLES.ADMIN), assignAuditor);
router.patch('/:id/verify-asset', verifyAsset);
router.patch('/:id/close', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), closeAudit);

module.exports = router;
