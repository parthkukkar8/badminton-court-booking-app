const redisClient = require('../config/redis');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;

    // Read the state parameter Google sent back
    // This is exactly what we passed when redirecting to Google
    const state = req.query.state;
    const isAdminPortal = state === 'admin';

    console.log('State from Google:', state);
    console.log('Is admin portal:', isAdminPortal);
    console.log('User email:', user.email);
    console.log('Allowed admin:', process.env.ALLOWED_ADMIN_EMAIL);

    // If admin portal — verify email
    if (isAdminPortal) {
      if (user.email !== process.env.ALLOWED_ADMIN_EMAIL) {
        console.log('Email mismatch — rejecting');
        return res.redirect('http://localhost:5174/?error=not_admin');
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in Redis
    await redisClient.setex(
      `refresh:${user._id}`,
      7 * 24 * 60 * 60,
      refreshToken
    );

    // Redirect to correct portal
    const baseUrl = isAdminPortal
      ? 'http://localhost:5174'
      : 'http://localhost:5173';

    console.log('Redirecting to:', baseUrl);

    return res.redirect(
      `${baseUrl}/dashboard?token=${accessToken}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(user.avatar)}`
    );

  } catch (error) {
    console.log('Callback error:', error.message);
    res.redirect('http://localhost:5173/?error=login_failed');
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user._id;
    await redisClient.del(`refresh:${userId}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
};

module.exports = { googleAuthCallback, logout };
