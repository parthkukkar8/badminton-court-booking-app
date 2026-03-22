const express = require('express');
const authMiddleware = require('../middlewares/auth');
const { createOrder, verifyPayment } = require('../controllers/payment.controller');

const router = express.Router();

// Create Razorpay order (user must be logged in)
router.post('/create-order', authMiddleware, createOrder);

// Verify payment after user pays
router.post('/verify', authMiddleware, verifyPayment);

module.exports = router;