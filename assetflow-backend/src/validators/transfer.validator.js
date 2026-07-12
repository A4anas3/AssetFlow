const { body } = require('express-validator');

const transferValidator = [
  body('asset').isMongoId().withMessage('Valid asset ID is required'),
  body('fromDepartment').isMongoId().withMessage('Valid source department ID is required'),
  body('toDepartment').isMongoId().withMessage('Valid destination department ID is required'),
  body('reason').optional().trim(),
];

module.exports = { transferValidator };
