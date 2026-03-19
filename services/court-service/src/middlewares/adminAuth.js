const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  try {
    // Get token from request headers
    // Frontend sends it as: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Extract just the token part (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    // Verify the token using our secret
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Check if the email in the token is the allowed admin email
    if (decoded.email !== process.env.ALLOWED_ADMIN_EMAIL) {
      return res.status(403).json({ 
        message: 'Access denied. You are not an admin.' 
      });
    }

    // Everything is fine — attach user info to request
    req.admin = decoded;

    // Move to the next function (the actual route handler)
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = adminAuth;