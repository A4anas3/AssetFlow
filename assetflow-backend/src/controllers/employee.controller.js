const Employee = require('../models/Employee.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');

const getEmployees = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.department) query.department = req.query.department;
  if (req.query.status) query.status = req.query.status;
  const result = await paginate(Employee, query, { page: req.query.page, limit: req.query.limit, populate: [{ path: 'user', select: 'name email avatar' }, { path: 'department', select: 'name code' }] });
  res.json(new ApiResponse(200, result));
});

const getEmployeeById = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id).populate('user', 'name email avatar').populate('department', 'name code');
  if (!emp) throw new ApiError(404, 'Employee not found');
  res.json(new ApiResponse(200, emp));
});

const createEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.create(req.body);
  await logActivity({ actor: req.user._id, action: 'Created employee record', module: 'employee', targetId: emp._id });
  res.status(201).json(new ApiResponse(201, emp, 'Employee created'));
});

const updateEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!emp) throw new ApiError(404, 'Employee not found');
  await logActivity({ actor: req.user._id, action: 'Updated employee', module: 'employee', targetId: emp._id });
  res.json(new ApiResponse(200, emp, 'Employee updated'));
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findByIdAndDelete(req.params.id);
  if (!emp) throw new ApiError(404, 'Employee not found');
  await logActivity({ actor: req.user._id, action: 'Deleted employee', module: 'employee', targetId: emp._id });
  res.json(new ApiResponse(200, null, 'Employee deleted'));
});

const promoteEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, { designation: req.body.designation, role: req.body.role }, { new: true });
  if (!emp) throw new ApiError(404, 'Employee not found');
  await logActivity({ actor: req.user._id, action: 'Promoted employee', module: 'employee', targetId: emp._id });
  res.json(new ApiResponse(200, emp, 'Employee promoted'));
});

const updateEmployeeStatus = asyncHandler(async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!emp) throw new ApiError(404, 'Employee not found');
  res.json(new ApiResponse(200, emp, 'Status updated'));
});

const updateEmployeeDepartment = asyncHandler(async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, { department: req.body.department }, { new: true });
  if (!emp) throw new ApiError(404, 'Employee not found');
  await logActivity({ actor: req.user._id, action: 'Changed employee department', module: 'employee', targetId: emp._id });
  res.json(new ApiResponse(200, emp, 'Department updated'));
});

const updateEmployeeRole = asyncHandler(async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!emp) throw new ApiError(404, 'Employee not found');
  await logActivity({ actor: req.user._id, action: 'Changed employee role', module: 'employee', targetId: emp._id });
  res.json(new ApiResponse(200, emp, 'Role updated'));
});

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, promoteEmployee, updateEmployeeStatus, updateEmployeeDepartment, updateEmployeeRole };
