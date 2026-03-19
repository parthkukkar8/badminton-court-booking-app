const express = require('express');
const passport = require('passport');
const { googleAuthCallback, logout } = require('../controllers/auth.controller');

const router = express.Router();

router.get('/google', (req, res, next) => {
  const portal = req.query.portal || 'user';

  console.log('Portal received:', portal);

  // Pass portal info as 'state' parameter
  // Google sends this exact value BACK to us in the callback
  // No sessions needed!
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: portal,   // ← Google preserves this and returns it
  })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/api/auth/failure',
  }),
  googleAuthCallback
);

router.get('/failure', (req, res) => {
  res.status(401).json({ message: 'Google login failed' });
});

router.post('/logout', logout);

module.exports = router;