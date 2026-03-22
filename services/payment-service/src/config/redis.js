const Redis = require('ioredis');

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('connect', () => {
  console.log('✅ Payment Service — Redis connected');
});

redisClient.on('error', (error) => {
  console.error('❌ Redis error:', error.message);
});

module.exports = redisClient;