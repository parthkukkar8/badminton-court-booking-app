const Booking = require('../models/booking.model');
const redisClient = require('../config/redis');
const axios = require('axios');

// Determine court service URL based on environment
// In Docker → use container name
// In local → use localhost
const COURT_SERVICE_URL = process.env.COURT_SERVICE_URL || 'http://localhost:3002';

const bookSlot = async (req, res) => {
  try {
    const { courtId, courtName, slotId, startTime, endTime, pricePerSlot } = req.body;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    const isLocked = await redisClient.get(`booked:${courtId}:${slotId}`);
    if (isLocked) {
      return res.status(400).json({
        message: 'Sorry! This slot was just booked by someone else.'
      });
    }

    await redisClient.setex(
      `booked:${courtId}:${slotId}`,
      10 * 60,
      userId
    );

    const booking = await Booking.create({
      courtId,
      courtName,
      userId,
      userEmail,
      slotId,
      startTime,
      endTime,
      pricePerSlot,
      status: 'pending',
    });

    req.io.to(courtId).emit('slot-booked', { slotId });

    res.status(201).json({
      message: 'Slot locked! Please complete payment.',
      booking,
    });

  } catch (error) {
    console.error('Booking error:', error.message);
    res.status(500).json({
      message: 'Failed to book slot',
      error: error.message
    });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'confirmed' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // ✅ Using COURT_SERVICE_URL variable
    await axios.patch(
      `${COURT_SERVICE_URL}/api/courts/${booking.courtId}/slots/${booking.slotId}`,
      { isBooked: true }
    );

    console.log(`✅ Booking ${bookingId} confirmed after payment`);
    res.json({ message: 'Booking confirmed', booking });

  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm booking' });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    console.log('Cancel booking called for:', bookingId);

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'pending') {
      await Booking.findByIdAndDelete(bookingId);
      console.log('🗑️ Pending booking deleted:', bookingId);
    } else {
      await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' });
      console.log('❌ Confirmed booking cancelled:', bookingId);
    }

    await redisClient.del(`booked:${booking.courtId}:${booking.slotId}`);

    try {
      req.io.to(booking.courtId).emit('slot-released', {
        slotId: booking.slotId
      });
    } catch (socketError) {
      console.error('Socket emit failed:', socketError.message);
    }

    res.json({ message: 'Booking cancelled, slot released' });

  } catch (error) {
    console.error('Cancel error:', error.message);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

const userCancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        message: 'Only confirmed bookings can be cancelled'
      });
    }

    await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' });

    // ✅ Using COURT_SERVICE_URL variable instead of localhost
    await axios.patch(
      `${COURT_SERVICE_URL}/api/courts/${booking.courtId}/slots/${booking.slotId}`,
      { isBooked: false }
    );

    await redisClient.del(`booked:${booking.courtId}:${booking.slotId}`);

    console.log(`❌ User cancelled confirmed booking: ${bookingId}`);
    res.json({ message: 'Booking cancelled successfully' });

  } catch (error) {
    console.error('User cancel error:', error.message);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

module.exports = {
  bookSlot,
  getUserBookings,
  confirmBooking,
  cancelBooking,
  userCancelBooking
};