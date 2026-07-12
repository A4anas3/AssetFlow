const express = require('express');
const router = express.Router();
const { getUtilizationReport, getMaintenanceReport, getDepartmentSummary, getBookingHeatmap, getRetirementReport, exportReport } = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/constants');

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER));
router.get('/utilization', getUtilizationReport);
router.get('/maintenance', getMaintenanceReport);
router.get('/department-summary', getDepartmentSummary);
router.get('/booking-heatmap', getBookingHeatmap);
router.get('/retirement', getRetirementReport);
router.get('/export', exportReport);

module.exports = router;
