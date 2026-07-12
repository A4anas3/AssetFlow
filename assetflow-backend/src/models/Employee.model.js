const mongoose = require('mongoose');
const { ROLES, EMPLOYEE_STATUS } = require('../config/constants');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: { type: String, required: true, trim: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.EMPLOYEE },
    status: { type: String, enum: Object.values(EMPLOYEE_STATUS), default: EMPLOYEE_STATUS.ACTIVE },
    joinedAt: { type: Date, default: Date.now },
    phone: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
