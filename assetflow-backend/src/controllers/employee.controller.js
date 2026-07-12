const Employee = require('../models/Employee.model');
const User = require('../models/User.model');
const Department = require('../models/Department.model');
const { ApiResponse, ApiError } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const logActivity = require('../utils/activityLogger');
const { ROLES } = require('../config/constants');

const getEmployees = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.department) query.department = req.query.department;
  if (req.query.status) query.status = req.query.status;
  if (req.query.role) query.role = req.query.role;
  const result = await paginate(Employee, query, {
    page: req.query.page,
    limit: req.query.limit,
    populate: [
      { path: 'user', select: 'name email avatar isActive' },
      { path: 'department', select: 'name code' },
    ],
  });
  res.json(new ApiResponse(200, result));
});

const getEmployeeById = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id)
    .populate('user', 'name email avatar isActive')
    .populate('department', 'name code');
  if (!emp) throw new ApiError(404, 'Employee not found');
  res.json(new ApiResponse(200, emp));
});

const createEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.create({
    ...req.body,
    role: ROLES.EMPLOYEE,
  });

  await logActivity({
    actor: req.user._id,
    action: 'Created employee record',
    module: 'employee',
    targetId: emp._id,
  });

  res.status(201).json(new ApiResponse(201, emp, 'Employee created'));
});

const updateEmployee = asyncHandler(async (req, res) => {
  const { role, ...updateData } = req.body;
  const emp = await Employee.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!emp) throw new ApiError(404, 'Employee not found');
  await logActivity({
    actor: req.user._id,
    action: 'Updated employee',
    module: 'employee',
    targetId: emp._id,
  });
  res.json(new ApiResponse(200, emp, 'Employee updated'));
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) throw new ApiError(404, 'Employee not found');

  // Check for active allocations before deleting
  const Allocation = require('../models/Allocation.model');
  const activeAlloc = await Allocation.findOne({ employee: emp._id, status: 'active' });
  if (activeAlloc)
    throw new ApiError(400, 'Cannot delete employee with active asset allocations');

  await emp.deleteOne();
  await logActivity({
    actor: req.user._id,
    action: 'Deleted employee',
    module: 'employee',
    targetId: emp._id,
  });
  res.json(new ApiResponse(200, null, 'Employee deleted'));
});

// Spec: "Admin promotes Employee to Department Head or Asset Manager — the only place roles are assigned"
const promoteEmployee = asyncHandler(async (req, res) => {
  const { designation, role } = req.body;

  // Only allow promotion to non-admin roles
  if (role === ROLES.ADMIN)
    throw new ApiError(403, 'Cannot promote an employee to admin role');

  const emp = await Employee.findByIdAndUpdate(
    req.params.id,
    { designation, role },
    { new: true }
  ).populate('user department');
  if (!emp) throw new ApiError(404, 'Employee not found');

  // Sync the role on the User document so JWT-based auth reflects the new role
  await User.findByIdAndUpdate(emp.user._id, { role });

  // If promoted to DEPARTMENT_HEAD, update the department's head field
  if (role === ROLES.DEPARTMENT_HEAD && emp.department) {
    await Department.findByIdAndUpdate(emp.department._id, { head: emp.user._id });
  }

  // If demoted from DEPARTMENT_HEAD, clear the department head field if they were head
  if (role !== ROLES.DEPARTMENT_HEAD && emp.department) {
    await Department.findOneAndUpdate(
      { _id: emp.department._id, head: emp.user._id },
      { head: null }
    );
  }

  await logActivity({
    actor: req.user._id,
    action: `Promoted employee to ${role}`,
    module: 'employee',
    targetId: emp._id,
  });
  res.json(new ApiResponse(200, emp, 'Employee promoted'));
});

const updateEmployeeStatus = asyncHandler(async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!emp) throw new ApiError(404, 'Employee not found');
  // Sync isActive on User as well
  await User.findByIdAndUpdate(emp.user, {
    isActive: req.body.status === 'active',
  });
  res.json(new ApiResponse(200, emp, 'Status updated'));
});

const updateEmployeeDepartment = asyncHandler(async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(
    req.params.id,
    { department: req.body.department },
    { new: true }
  );
  if (!emp) throw new ApiError(404, 'Employee not found');
  await logActivity({
    actor: req.user._id,
    action: 'Changed employee department',
    module: 'employee',
    targetId: emp._id,
  });
  res.json(new ApiResponse(200, emp, 'Department updated'));
});

const updateEmployeeRole = asyncHandler(async (req, res) => {
  if (req.body.role === ROLES.ADMIN)
    throw new ApiError(403, 'Cannot assign admin role through this endpoint — use promote');

  const emp = await Employee.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  ).populate('user');
  if (!emp) throw new ApiError(404, 'Employee not found');

  // Sync role on the User document
  await User.findByIdAndUpdate(emp.user._id, { role: req.body.role });

  await logActivity({
    actor: req.user._id,
    action: 'Changed employee role',
    module: 'employee',
    targetId: emp._id,
  });
  res.json(new ApiResponse(200, emp, 'Role updated'));
});

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  promoteEmployee,
  updateEmployeeStatus,
  updateEmployeeDepartment,
  updateEmployeeRole,
};
