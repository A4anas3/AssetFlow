const mongoose = require('mongoose');
const { TRANSFER_STATUS } = require('../config/constants');

const transferSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    fromDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    toDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: Object.values(TRANSFER_STATUS), default: TRANSFER_STATUS.PENDING },
    reason: { type: String, default: '' },
    rejectionReason: { type: String, default: '' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transfer', transferSchema);
