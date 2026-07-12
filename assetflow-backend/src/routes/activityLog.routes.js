const express = require('express');
const router = express.Router();
const { getActivityLogs, getActivityLogById } = require('../controllers/activityLog.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/constants');

router.use(protect);
router.use(authorize(ROLES.ADMIN));
router.get('/', getActivityLogs);
router.get('/:id', getActivityLogById);

module.exports = router;
