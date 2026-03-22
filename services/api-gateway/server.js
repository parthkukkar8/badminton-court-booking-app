require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logger = require('./src/middlewares/logger');
const authMiddleware = require('./src/middlewares/auth');
const { generalLimiter, authLimiter } = require('./src/middlewares/rateLimiter');
const setupRoutes = require('./src/routes/index');

const app = express();

// ─── CORS ─────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// ─── LOGGING ──────────────────────────────────────
// Log every request that hits the gateway
app.use(logger);

// ─── RATE LIMITING ────────────────────────────────
// Apply strict limiter to auth routes
app.use('/api/auth', authLimiter);
// Apply general limiter to all routes
app.use(generalLimiter);

// ─── JWT VERIFICATION ─────────────────────────────
// Verify token before forwarding to services
app.use(authMiddleware);

// ─── PROXY ROUTES ─────────────────────────────────
// Forward requests to correct microservice
setupRoutes(app);

// ─── HEALTH CHECK ─────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    message: '✅ API Gateway is running!',
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      courts: process.env.COURT_SERVICE_URL,
      booking: process.env.BOOKING_SERVICE_URL,
      payment: process.env.PAYMENT_SERVICE_URL,
    },
  });
});

// ─── 404 HANDLER ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Routing to:`);
  console.log(`   Auth    → ${process.env.AUTH_SERVICE_URL}`);
  console.log(`   Courts  → ${process.env.COURT_SERVICE_URL}`);
  console.log(`   Booking → ${process.env.BOOKING_SERVICE_URL}`);
  console.log(`   Payment → ${process.env.PAYMENT_SERVICE_URL}`);
});