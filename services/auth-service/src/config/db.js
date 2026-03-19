// Import mongoose to connect to MongoDB
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect using the URL from .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Stop the app if DB fails — no point running without it
    process.exit(1);
  }
};

module.exports = connectDB;