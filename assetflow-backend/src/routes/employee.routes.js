const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, promoteEmployee, updateEmployeeStatus, updateEmployeeDepartment, updateEmployeeRole } = require('../controllers/employee.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { employeeValidator, updateEmployeeValidator } = require('../validators/employee.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize(ROLES.ADMIN), validate(employeeValidator), createEmployee);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateEmployeeValidator), updateEmployee);
router.delete('/:id', authorize(ROLES.ADMIN), deleteEmployee);
router.patch('/:id/promote', authorize(ROLES.ADMIN), promoteEmployee);
router.patch('/:id/status', authorize(ROLES.ADMIN), updateEmployeeStatus);
router.patch('/:id/department', authorize(ROLES.ADMIN), updateEmployeeDepartment);
router.patch('/:id/role', authorize(ROLES.ADMIN), updateEmployeeRole);

module.exports = router;
