const Category = require('../models/Category.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');

const getCategories = asyncHandler(async (req, res) => {
  const result = await paginate(Category, {}, { page: req.query.page, limit: req.query.limit, populate: 'parentCategory', sort: { name: 1 } });
  res.json(new ApiResponse(200, result));
});

const getCategoryById = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id).populate('parentCategory', 'name');
  if (!cat) throw new ApiError(404, 'Category not found');
  res.json(new ApiResponse(200, cat));
});

const createCategory = asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  await logActivity({ actor: req.user._id, action: 'Created category', module: 'category', targetId: cat._id });
  res.status(201).json(new ApiResponse(201, cat, 'Category created'));
});

const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!cat) throw new ApiError(404, 'Category not found');
  await logActivity({ actor: req.user._id, action: 'Updated category', module: 'category', targetId: cat._id });
  res.json(new ApiResponse(200, cat, 'Category updated'));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndDelete(req.params.id);
  if (!cat) throw new ApiError(404, 'Category not found');
  await logActivity({ actor: req.user._id, action: 'Deleted category', module: 'category', targetId: cat._id });
  res.json(new ApiResponse(200, null, 'Category deleted'));
});

module.exports = { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
