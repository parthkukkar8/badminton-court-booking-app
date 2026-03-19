// Import ioredis to talk to Redis
const Redis = require('ioredis');

// Create redis client using URL from .env
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (error) => {
  console.error('❌ Redis error:', error.message);
});

module.exports = redisClient;