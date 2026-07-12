const mongoose = require('mongoose');
const { AUDIT_STATUS } = require('../config/constants');

const auditAssetSchema = new mongoose.Schema({
  asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  verified: { type: Boolean, default: false },
  // Spec: Verified / Missing / Damaged
  condition: { type: String, enum: ['good', 'damaged', 'missing'], default: 'good' },
  notes: { type: String, default: '' },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

const auditSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    // Scope: department and/or location
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    location: { type: String, default: '' },

    // Spec: "Assign one or more auditors to the cycle"
    auditors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assets: [auditAssetSchema],

    status: {
      type: String,
      enum: Object.values(AUDIT_STATUS),
      default: AUDIT_STATUS.PLANNED,
    },

    // Spec: "date range" for the audit cycle
    startDate: { type: Date },
    endDate: { type: Date },
    scheduledDate: { type: Date },
    closedAt: { type: Date },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Audit', auditSchema);
