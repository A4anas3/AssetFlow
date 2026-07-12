const { body } = require('express-validator');

const employeeValidator = [
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('user').isMongoId().withMessage('Valid user ID is required'),
  body('department').isMongoId().withMessage('Valid department ID is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),
];

const updateEmployeeValidator = [
  body('designation').optional().trim().notEmpty().withMessage('Designation cannot be empty'),
  body('department').optional().isMongoId().withMessage('Valid department ID is required'),
];

module.exports = { employeeValidator, updateEmployeeValidator };
