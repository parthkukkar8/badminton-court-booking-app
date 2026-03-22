const { Kafka } = require('kafkajs');

// Create Kafka instance
// clientId → name of our app (just for logging)
// brokers  → where Kafka is running
const kafka = new Kafka({
  clientId: 'badminton-notification',
  brokers: [process.env.KAFKA_BROKER],
});

module.exports = kafka;