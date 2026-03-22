const { createProxyMiddleware } = require('http-proxy-middleware');

const setupRoutes = (app) => {

  // AUTH SERVICE
  // Express strips /api/auth → proxy sees /google
  // pathRewrite adds /api/auth back → /api/auth/google
  app.use('/api/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/auth${path}`,
    on: {
      error: (err, req, res) => {
        console.error('Auth proxy error:', err.message);
        res.status(502).json({ message: 'Auth service unavailable' });
      },
    },
  }));

  // COURT SERVICE
  app.use('/api/courts', createProxyMiddleware({
    target: process.env.COURT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/courts${path}`,
    on: {
      error: (err, req, res) => {
        console.error('Court proxy error:', err.message);
        res.status(502).json({ message: 'Court service unavailable' });
      },
    },
  }));

  // BOOKING SERVICE
  app.use('/api/bookings', createProxyMiddleware({
    target: process.env.BOOKING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/bookings${path}`,
    on: {
      error: (err, req, res) => {
        console.error('Booking proxy error:', err.message);
        res.status(502).json({ message: 'Booking service unavailable' });
      },
    },
  }));

  // PAYMENT SERVICE
  app.use('/api/payments', createProxyMiddleware({
    target: process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/api/payments${path}`,
    on: {
      error: (err, req, res) => {
        console.error('Payment proxy error:', err.message);
        res.status(502).json({ message: 'Payment service unavailable' });
      },
    },
  }));

};

module.exports = setupRoutes;
