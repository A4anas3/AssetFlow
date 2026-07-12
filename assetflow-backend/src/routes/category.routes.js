const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { categoryValidator, updateCategoryValidator } = require('../validators/category.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), validate(categoryValidator), createCategory);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), validate(updateCategoryValidator), updateCategory);
router.delete('/:id', authorize(ROLES.ADMIN), deleteCategory);

module.exports = router;
