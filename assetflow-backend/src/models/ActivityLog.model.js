const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    module: {
      type: String,
      enum: ['auth', 'asset', 'allocation', 'transfer', 'booking', 'maintenance', 'audit', 'department', 'category', 'employee', 'profile', 'settings', 'report'],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
