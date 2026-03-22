const rateLimit = require('express-rate-limit');

// General rate limiter
// Max 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: {
    error: 'Too many requests. Please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for auth routes
// Max 10 requests per minute (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many auth attempts. Please try again after a minute.'
  },
});

module.exports = { generalLimiter, authLimiter };