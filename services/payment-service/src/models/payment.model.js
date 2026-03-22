const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      // Which booking this payment is for
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    razorpayOrderId: {
      // Order ID created by Razorpay
      // e.g. order_xxxxxxxxxxxxx
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      // Payment ID after successful payment
      // e.g. pay_xxxxxxxxxxxxx
      type: String,
      default: null,
    },
    razorpaySignature: {
      // HMAC signature from Razorpay webhook
      // We verify this to confirm payment is genuine
      type: String,
      default: null,
    },
    amount: {
      // Amount in paise (₹300 = 30000 paise)
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      // created   → order created, payment not done
      // paid      → payment successful ✅
      // failed    → payment failed ❌
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;