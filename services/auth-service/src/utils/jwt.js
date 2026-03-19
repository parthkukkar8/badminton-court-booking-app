const jwt = require('jsonwebtoken');

// ✅ email added as a parameter
const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { userId, email },                    // both stored in token
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
