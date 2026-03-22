const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/payment.model');
const axios = require('axios');
const { publishBookingConfirmed } = require('../config/kafka');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const userId = req.user.userId;

    const amountInPaise = amount * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: { bookingId, userId },
    });

    const payment = await Payment.create({
      bookingId,
      userId,
      razorpayOrderId: order.id,
      amount: amountInPaise,
    });

    res.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      paymentId: payment._id,
    });

  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({
      message: 'Failed to create payment order',
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingId,
    } = req.body;

    // Verify HMAC signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'paid',
      }
    );

    // Confirm booking in booking service
    const bookingRes = await axios.patch(
      `http://booking-service:3003/api/bookings/${bookingId}/confirm`
    );
    const booking = bookingRes.data.booking;

    console.log('✅ Booking confirmed:', booking._id);

    // Publish Kafka event — wrapped in try/catch
    // If Kafka fails → payment is still confirmed ✅
    // Email just won't be sent — non critical
    try {
      await publishBookingConfirmed({
        bookingId,
        userEmail: booking.userEmail,
        userName: booking.userEmail.split('@')[0],
        courtName: booking.courtName,
        startTime: booking.startTime,
        endTime: booking.endTime,
        amount: booking.pricePerSlot,
      });
    } catch (kafkaError) {
      // Kafka failure should NOT fail the payment
      console.error('❌ Kafka publish failed (non critical):', kafkaError.message);
    }

    // Always return success if payment + booking confirmed
    res.json({
      message: 'Payment verified successfully!',
      success: true,
    });

  } catch (error) {
    console.error('Verify payment error:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    console.error('Stack:', error.stack);
    res.status(500).json({
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

module.exports = { createOrder, verifyPayment };