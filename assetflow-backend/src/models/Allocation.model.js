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

    // Spec: "capture condition check-in notes" on return
    conditionOnReturn: {
      type: String,
      enum: ['new', 'good', 'fair', 'poor', 'damaged'],
      default: null,
    },
    returnNotes: { type: String, default: '' },

    status: {
      type: String,
      enum: Object.values(ALLOCATION_STATUS),
      default: ALLOCATION_STATUS.ACTIVE,
    },
    notes: { type: String, default: '' },

    // Set when this allocation ends due to a transfer approval
    transferredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Allocation', default: null },
  },
  { timestamps: true }
);

// Virtual: is this allocation overdue?
allocationSchema.virtual('isOverdue').get(function () {
  if (this.status !== 'active' || !this.expectedReturnDate) return false;
  return new Date() > new Date(this.expectedReturnDate);
});

allocationSchema.set('toJSON', { virtuals: true });
allocationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Allocation', allocationSchema);
