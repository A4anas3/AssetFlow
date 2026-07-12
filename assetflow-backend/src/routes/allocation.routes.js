const express = require('express');
const router = express.Router();
const { getAllocations, getAllocationById, createAllocation, requestReturn, approveReturn, cancelAllocation } = require('../controllers/allocation.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { allocationValidator } = require('../validators/allocation.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', getAllocations);
router.get('/:id', getAllocationById);
router.post('/', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), validate(allocationValidator), createAllocation);
router.patch('/:id/return', requestReturn);
router.patch('/:id/approve-return', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), approveReturn);
router.patch('/:id/cancel', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), cancelAllocation);

module.exports = router;
