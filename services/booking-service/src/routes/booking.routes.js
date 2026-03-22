const express = require('express');
const authMiddleware = require('../middlewares/auth');
const {
  bookSlot,
  getUserBookings,
  confirmBooking,
  cancelBooking,
  userCancelBooking,
} = require('../controllers/booking.controller');

const router = express.Router();

router.post('/book', authMiddleware, bookSlot);
router.get('/my-bookings', authMiddleware, getUserBookings);
router.patch('/:bookingId/confirm', confirmBooking);
router.patch('/:bookingId/cancel', authMiddleware, cancelBooking);
// ← NEW: explicit user cancellation of confirmed booking
router.patch('/:bookingId/user-cancel', authMiddleware, userCancelBooking);

module.exports = router;