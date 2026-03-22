const jwt = require('jsonwebtoken');

// Public routes that don't need JWT verification
const PUBLIC_ROUTES = [
  { path: '/api/auth/google', method: 'GET' },
  { path: '/api/auth/google/callback', method: 'GET' },
  { path: '/api/auth/failure', method: 'GET' },
  { path: '/api/courts/nearby', method: 'GET' },
];

const authMiddleware = (req, res, next) => {
  // Check if this is a public route
  const isPublic = PUBLIC_ROUTES.some(
    route =>
      req.path.startsWith(route.path) &&
      (route.method === req.method || route.method === 'ALL')
  );

  // Skip auth for public routes
  if (isPublic) {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Attach user info to request headers
    // So downstream services can use it
    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-user-email'] = decoded.email;

    next();

  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;