const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../config/constants');

const bookingSchema = new mongoose.Schema(
  {
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    purpose: { type: String, default: '' },

    // Spec: Upcoming, Ongoing, Completed, Cancelled
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.UPCOMING,
    },

    cancelledAt: { type: Date },
    cancelReason: { type: String, default: '' },
    rescheduledAt: { type: Date },

    // For future reminder job — track if pre-slot reminder was sent
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
