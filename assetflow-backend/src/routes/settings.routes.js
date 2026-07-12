const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', getSettings);
router.put('/', authorize(ROLES.ADMIN), updateSettings);

module.exports = router;
