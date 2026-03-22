const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'badminton-payment',
  // ← Use environment variable instead of hardcoded localhost
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
  console.log('✅ Kafka producer connected');
};

const publishBookingConfirmed = async (bookingData) => {
  await producer.send({
    topic: 'booking.confirmed',
    messages: [
      {
        key: bookingData.bookingId,
        value: JSON.stringify(bookingData),
      },
    ],
  });
  console.log('✅ Kafka event published: booking.confirmed');
};

module.exports = { connectProducer, publishBookingConfirmed };