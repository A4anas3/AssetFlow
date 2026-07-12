const { body } = require('express-validator');

const categoryValidator = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('depreciationRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Depreciation rate must be between 0 and 100'),
];

const updateCategoryValidator = [
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('depreciationRate').optional().isFloat({ min: 0, max: 100 }).withMessage('Depreciation rate must be between 0 and 100'),
];

module.exports = { categoryValidator, updateCategoryValidator };
