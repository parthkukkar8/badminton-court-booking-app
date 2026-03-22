const Booking = require('../models/booking.model');
const redisClient = require('../config/redis');
const axios = require('axios');

// Book a slot
const bookSlot = async (req, res) => {
  try {
    const { courtId, courtName, slotId, startTime, endTime, pricePerSlot } = req.body;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    // Check Redis — is slot already locked?
    const isLocked = await redisClient.get(`booked:${courtId}:${slotId}`);
    if (isLocked) {
      return res.status(400).json({
        message: 'Sorry! This slot was just booked by someone else.'
      });
    }

    // Lock slot in Redis for 10 minutes
    // This prevents double booking during payment window
    await redisClient.setex(
      `booked:${courtId}:${slotId}`,
      10 * 60,
      userId
    );

    // Save booking as PENDING in MongoDB
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

    // ← REMOVED: axios call to mark slot as booked
    // Slot will only be marked in MongoDB after payment confirmed

    // Emit socket event — slot is now locked
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

// Get all bookings for a user
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 }); // newest first

    res.json({ bookings });

  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Confirm booking after payment verified
const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'confirmed' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // NOW mark slot as permanently booked in court service
    // Only after payment is confirmed ✅
    await axios.patch(
      `http://localhost:3002/api/courts/${booking.courtId}/slots/${booking.slotId}`,
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

    // Find booking first to get courtId and slotId
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only delete if status is PENDING
    // (payment was never completed)
    // If status is confirmed → this is a real cancellation
    if (booking.status === 'pending') {
      // DELETE the booking entirely — don't show in My Bookings
      await Booking.findByIdAndDelete(bookingId);
      console.log('🗑️ Pending booking deleted:', bookingId);
    } else {
      // Confirmed booking being cancelled → keep record
      await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' });
      console.log('❌ Confirmed booking cancelled:', bookingId);
    }

    // Release Redis lock — slot is free again
    await redisClient.del(`booked:${booking.courtId}:${booking.slotId}`);

    // Tell all users slot is available again
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

// User explicitly cancels a CONFIRMED booking
const userCancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure this booking belongs to this user
    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only confirmed bookings can be explicitly cancelled
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ 
        message: 'Only confirmed bookings can be cancelled' 
      });
    }

    // Mark as cancelled
    await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' });

    // Free the slot in court service
    await axios.patch(
      `http://localhost:3002/api/courts/${booking.courtId}/slots/${booking.slotId}`,
      { isBooked: false }
    );

    // Clear Redis cache
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

