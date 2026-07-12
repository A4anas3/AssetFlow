const express = require('express');
const router = express.Router();
const {
  getUtilizationReport,
  getMaintenanceReport,
  getMaintenanceFrequency,
  getDepartmentSummary,
  getBookingHeatmap,
  getRetirementReport,
  getAssetsNearingRetirement,
  getOverdueAllocationsReport,
  exportReport,
} = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/constants');

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER));

// Spec: asset utilization trends
router.get('/utilization', getUtilizationReport);

// Spec: maintenance report + frequency by asset/category
router.get('/maintenance', getMaintenanceReport);
router.get('/maintenance-frequency', getMaintenanceFrequency);

// Spec: department-wise allocation summary
router.get('/department-summary', getDepartmentSummary);

// Spec: resource booking heatmap (peak usage windows)
router.get('/booking-heatmap', getBookingHeatmap);

// Spec: assets nearing retirement / warranty expiry
router.get('/retirement', getRetirementReport);
router.get('/nearing-retirement', getAssetsNearingRetirement);

// Spec: overdue returns report
router.get('/overdue-allocations', getOverdueAllocationsReport);

// Spec: exportable reports
router.get('/export', exportReport);

module.exports = router;
