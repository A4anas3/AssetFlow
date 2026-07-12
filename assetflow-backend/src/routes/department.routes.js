const express = require('express');
const router = express.Router();
const { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment, updateDepartmentStatus } = require('../controllers/department.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { departmentValidator, updateDepartmentValidator } = require('../validators/department.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize(ROLES.ADMIN), validate(departmentValidator), createDepartment);
router.put('/:id', authorize(ROLES.ADMIN), validate(updateDepartmentValidator), updateDepartment);
router.delete('/:id', authorize(ROLES.ADMIN), deleteDepartment);
router.patch('/:id/status', authorize(ROLES.ADMIN), updateDepartmentStatus);

module.exports = router;
