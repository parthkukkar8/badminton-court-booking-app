const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    courtId: {
      // Which court was booked
      type: String,
      required: true,
    },
    courtName: {
      // Store court name directly so we don't need to
      // query court service every time
      type: String,
      required: true,
    },
    userId: {
      // Which user made the booking
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    slotId: {
      // The specific slot that was booked (_id of slot)
      type: String,
      required: true,
    },
    startTime: {
      // e.g. "06:00"
      type: String,
      required: true,
    },
    endTime: {
      // e.g. "07:00"
      type: String,
      required: true,
    },
    pricePerSlot: {
      type: Number,
      required: true,
    },
    status: {
      // pending  → slot selected, payment not done yet
      // confirmed → payment done ✅
      // cancelled → user cancelled
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;