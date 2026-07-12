const mongoose = require('mongoose');
const { ALLOCATION_STATUS } = require('../config/constants');

const allocationSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    allocatedAt: { type: Date, default: Date.now },
    expectedReturnDate: { type: Date },
    returnedAt: { type: Date },
    returnApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: Object.values(ALLOCATION_STATUS), default: ALLOCATION_STATUS.ACTIVE },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Allocation', allocationSchema);
