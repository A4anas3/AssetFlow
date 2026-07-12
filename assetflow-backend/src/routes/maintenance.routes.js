const express = require('express');
const router = express.Router();
const { getMaintenanceRequests, getMaintenanceById, createMaintenance, approveMaintenance, rejectMaintenance, assignMaintenance, startMaintenance, resolveMaintenance } = require('../controllers/maintenance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { maintenanceValidator } = require('../validators/maintenance.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', getMaintenanceRequests);
router.get('/:id', getMaintenanceById);
router.post('/', validate(maintenanceValidator), createMaintenance);
router.patch('/:id/approve', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), approveMaintenance);
router.patch('/:id/reject', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), rejectMaintenance);
router.patch('/:id/assign', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), assignMaintenance);
router.patch('/:id/start', startMaintenance);
router.patch('/:id/resolve', resolveMaintenance);

module.exports = router;
