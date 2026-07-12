const { body } = require('express-validator');

const maintenanceValidator = [
  body('asset').isMongoId().withMessage('Valid asset ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('estimatedCost').optional().isFloat({ min: 0 }).withMessage('Estimated cost must be a positive number'),
];

module.exports = { maintenanceValidator };
