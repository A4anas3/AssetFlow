const express = require('express');
const router = express.Router();
const {
  getMaintenanceRequests,
  getMaintenanceById,
  createMaintenance,
  approveMaintenance,
  rejectMaintenance,
  assignMaintenance,
  startMaintenance,
  resolveMaintenance,
} = require('../controllers/maintenance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { maintenanceValidator } = require('../validators/maintenance.validator');
const upload = require('../utils/upload');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', getMaintenanceRequests);
router.get('/:id', getMaintenanceById);

// Spec: "attach photo" — accept up to 5 photos on creation
// photos are uploaded, paths stored in req.files, then added to req.body.photos by middleware
router.post(
  '/',
  upload.maintenance.middleware,
  upload.maintenance.upload,
  (req, res, next) => {
    // Attach uploaded photo paths to body
    if (req.files && req.files.length > 0) {
      req.body.photos = req.files.map((f) => `/uploads/maintenance/${f.filename}`);
    }
    next();
  },
  validate(maintenanceValidator),
  createMaintenance
);

router.patch('/:id/approve', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), approveMaintenance);
router.patch('/:id/reject', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), rejectMaintenance);
router.patch('/:id/assign', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), assignMaintenance);
// start/resolve: authorization enforced inside controller (assigned technician or admin)
router.patch('/:id/start', startMaintenance);
router.patch('/:id/resolve', resolveMaintenance);

module.exports = router;
