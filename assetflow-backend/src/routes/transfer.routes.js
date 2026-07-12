const express = require('express');
const router = express.Router();
const { getTransfers, getTransferById, createTransfer, approveTransfer, rejectTransfer, cancelTransfer } = require('../controllers/transfer.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { transferValidator } = require('../validators/transfer.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', getTransfers);
router.get('/:id', getTransferById);
router.post('/', validate(transferValidator), createTransfer);
router.patch('/:id/approve', authorize(ROLES.ADMIN, ROLES.DEPARTMENT_HEAD), approveTransfer);
router.patch('/:id/reject', authorize(ROLES.ADMIN, ROLES.DEPARTMENT_HEAD), rejectTransfer);
router.patch('/:id/cancel', cancelTransfer);

module.exports = router;
