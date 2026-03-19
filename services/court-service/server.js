require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const courtRoutes = require('./src/routes/court.routes');

require('ioredis'); // just to init redis connection

connectDB();
require('./src/config/redis');

const app = express();

app.use(cors({
  // Allow requests from both main app and admin portal
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use(express.json());

app.use('/api/courts', courtRoutes);

app.get('/health', (req, res) => {
  res.json({ message: '✅ Court service is running!' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Court service running on port ${PORT}`);
});