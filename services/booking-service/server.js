require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');       // ← needed for socket.io
const { Server } = require('socket.io');  // ← socket.io
const connectDB = require('./src/config/db');
const bookingRoutes = require('./src/routes/booking.routes');

connectDB();
require('./src/config/redis');

const app = express();

// Create HTTP server from express app
// Socket.io needs this — it wraps the express app
const server = http.createServer(app);

// Create Socket.io server
// Allow connections from our frontend
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());

// Attach io to every request so controllers can use it
// This lets us emit socket events from inside controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/bookings', bookingRoutes);

app.get('/health', (req, res) => {
  res.json({ message: '✅ Booking service is running!' });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins a "room" for a specific court
  // When they open a court's slots page
  // Room name = courtId
  socket.on('join-court', (courtId) => {
    socket.join(courtId);
    console.log(`User ${socket.id} joined court room: ${courtId}`);
  });

  // User leaves court page
  socket.on('leave-court', (courtId) => {
    socket.leave(courtId);
    console.log(`User ${socket.id} left court room: ${courtId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Export io so controllers can use it
module.exports = { io };

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`🚀 Booking service running on port ${PORT}`);
});