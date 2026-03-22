require('dotenv').config();

const { startConsumer } = require('./src/consumers/booking.consumer');

console.log('🚀 Notification service starting...');
startConsumer();