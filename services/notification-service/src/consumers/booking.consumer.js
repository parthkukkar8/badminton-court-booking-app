const kafka = require('../config/kafka');
const { sendBookingConfirmation } = require('../services/email.service');

const consumer = kafka.consumer({ groupId: 'notification-group' });

const startConsumer = async () => {
  try {
    // Connect to Kafka
    await consumer.connect();
    console.log('✅ Kafka consumer connected');

    // Listen to this topic
    await consumer.subscribe({
      topic: 'booking.confirmed',
      fromBeginning: false,
    });

    // Process each message
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          console.log(`📨 New message on: ${topic}`);

          // Parse JSON from Kafka message
          const data = JSON.parse(message.value.toString());
          console.log('Booking data:', data);

          // Send confirmation email
          await sendBookingConfirmation(data);

        } catch (error) {
          console.error('Message processing error:', error.message);
        }
      },
    });

  } catch (error) {
    console.error('❌ Consumer error:', error.message);
    // Retry after 5 seconds if connection fails
    setTimeout(startConsumer, 5000);
  }
};

module.exports = { startConsumer };