require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const connectDB = require('./src/config/db');
const passport = require('./src/config/passport');
const authRoutes = require('./src/routes/auth.routes');

connectDB();
require('./src/config/redis');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use(express.json());

// Using default memory store — works fine for local development
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,           // ← true forces session to be saved
    saveUninitialized: true, // ← true saves session even before Google redirect
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 5 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ message: '✅ Auth service is running!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Auth service running on port ${PORT}`);
});