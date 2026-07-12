const mongoose = require('mongoose');
const { MAINTENANCE_STATUS } = require('../config/constants');

const maintenanceSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },

    status: {
      type: String,
      enum: Object.values(MAINTENANCE_STATUS),
      default: MAINTENANCE_STATUS.PENDING,
    },

    // Spec: "attach photo" when raising request
    photos: [{ type: String }],

    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 },

    startedAt: { type: Date },
    resolvedAt: { type: Date },
    rejectedAt: { type: Date },

    rejectionReason: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
