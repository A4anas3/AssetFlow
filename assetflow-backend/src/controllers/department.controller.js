const Department = require('../models/Department.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');

const getDepartments = asyncHandler(async (req, res) => {
  const result = await paginate(Department, {}, { page: req.query.page, limit: req.query.limit, populate: 'head', sort: { name: 1 } });
  res.json(new ApiResponse(200, result));
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id).populate('head', 'name email');
  if (!dept) throw new ApiError(404, 'Department not found');
  res.json(new ApiResponse(200, dept));
});

const createDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.create(req.body);
  await logActivity({ actor: req.user._id, action: 'Created department', module: 'department', targetId: dept._id });
  res.status(201).json(new ApiResponse(201, dept, 'Department created'));
});

const updateDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!dept) throw new ApiError(404, 'Department not found');
  await logActivity({ actor: req.user._id, action: 'Updated department', module: 'department', targetId: dept._id });
  res.json(new ApiResponse(200, dept, 'Department updated'));
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndDelete(req.params.id);
  if (!dept) throw new ApiError(404, 'Department not found');
  await logActivity({ actor: req.user._id, action: 'Deleted department', module: 'department', targetId: dept._id });
  res.json(new ApiResponse(200, null, 'Department deleted'));
});

const updateDepartmentStatus = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!dept) throw new ApiError(404, 'Department not found');
  res.json(new ApiResponse(200, dept, 'Status updated'));
});

module.exports = { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment, updateDepartmentStatus };
