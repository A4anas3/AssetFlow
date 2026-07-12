const express = require('express');
const router = express.Router();
const {
  getStats,
  getRecentActivities,
  getNotifications,
  getOverdueAllocations,
  getKpis,
} = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/stats', getStats);
router.get('/recent-activities', getRecentActivities);
router.get('/notifications', getNotifications);
// Spec: "Overdue returns highlighted separately on dashboard"
router.get('/overdue-allocations', getOverdueAllocations);
router.get('/kpis', getKpis);

module.exports = router;
