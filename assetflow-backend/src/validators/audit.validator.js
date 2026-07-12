const { body } = require('express-validator');

const auditValidator = [
  body('title').trim().notEmpty().withMessage('Audit title is required'),
  body('department').isMongoId().withMessage('Valid department ID is required'),
  body('scheduledDate').optional().isISO8601().withMessage('Valid date is required'),
];

module.exports = { auditValidator };
