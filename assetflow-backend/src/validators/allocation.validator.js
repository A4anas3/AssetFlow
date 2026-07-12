const { body } = require('express-validator');

const allocationValidator = [
  body('asset').isMongoId().withMessage('Valid asset ID is required'),
  body('employee').isMongoId().withMessage('Valid employee ID is required'),
  body('expectedReturnDate').optional().isISO8601().withMessage('Valid date is required'),
];

module.exports = { allocationValidator };
