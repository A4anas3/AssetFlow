const mongoose = require('mongoose');
const { AUDIT_STATUS } = require('../config/constants');

const auditAssetSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  verified: { type: Boolean, default: false },
  condition: { type: String, enum: ['good', 'damaged', 'missing'], default: 'good' },
  notes: { type: String, default: '' },
  verifiedAt: { type: Date },
});

const auditSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    auditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assets: [auditAssetSchema],
    status: { type: String, enum: Object.values(AUDIT_STATUS), default: AUDIT_STATUS.PLANNED },
    scheduledDate: { type: Date },
    closedAt: { type: Date },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Audit', auditSchema);
