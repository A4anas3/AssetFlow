const { body } = require('express-validator');

const assetValidator = [
  body('assetTag').trim().notEmpty().withMessage('Asset tag is required'),
  body('name').trim().notEmpty().withMessage('Asset name is required'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('purchaseValue').optional().isFloat({ min: 0 }).withMessage('Purchase value must be a positive number'),
];

const updateAssetValidator = [
  body('name').optional().trim().notEmpty().withMessage('Asset name cannot be empty'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
  body('purchaseValue').optional().isFloat({ min: 0 }).withMessage('Purchase value must be a positive number'),
];

module.exports = { assetValidator, updateAssetValidator };
