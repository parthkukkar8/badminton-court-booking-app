require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const paymentRoutes = require('./src/routes/payment.routes');
const { connectProducer } = require('./src/config/kafka');

connectDB();
require('./src/config/redis');

// Connect Kafka producer on startup
connectProducer();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use('/api/payments', paymentRoutes);

app.get('/health', (req, res) => {
  res.json({ message: '✅ Payment service is running!' });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`🚀 Payment service running on port ${PORT}`);
});