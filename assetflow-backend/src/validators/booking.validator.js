const { body } = require('express-validator');

const bookingValidator = [
  body('resource').isMongoId().withMessage('Valid resource ID is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
  body('purpose').optional().trim(),
];

const rescheduleValidator = [
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
];

module.exports = { bookingValidator, rescheduleValidator };
