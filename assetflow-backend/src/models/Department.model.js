const mongoose = require('mongoose');
const { DEPARTMENT_STATUS } = require('../config/constants');

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Optional parent for department hierarchy (spec: "optional Parent Department")
    parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },

    location: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(DEPARTMENT_STATUS),
      default: DEPARTMENT_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
