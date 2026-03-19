const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: {
    // Slot start e.g. "06:00"
    type: String,
    required: true,
  },
  endTime: {
    // Slot end e.g. "07:00"
    type: String,
    required: true,
  },
  isBooked: {
    // Is this slot already taken?
    type: Boolean,
    default: false,
  },
  bookedBy: {
    // Which user booked it (MongoDB user ID)
    type: String,
    default: null,
  },
});

const courtSchema = new mongoose.Schema(
  {
    name: {
      // e.g. "Smash Badminton Arena"
      type: String,
      required: true,
    },
    address: {
      // Full address as text
      // e.g. "123 MG Road, Bangalore"
      type: String,
      required: true,
    },
    location: {
      // GeoJSON format for geospatial queries
      // This lets MongoDB find courts "near me"
      type: {
        type: String,
        enum: ['Point'],  // must be 'Point' for GeoJSON
        required: true,
      },
      coordinates: {
        // [longitude, latitude] — NOTE: longitude comes FIRST in GeoJSON
        type: [Number],
        required: true,
      },
    },
    pricePerSlot: {
      // Cost per slot in rupees e.g. 300
      type: Number,
      required: true,
    },
    slots: [slotSchema],
    // Is this court active and visible to users?
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      // Admin's email who added this court
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on location
// This is REQUIRED for MongoDB geospatial queries ("find courts near me")
courtSchema.index({ location: '2dsphere' });

const Court = mongoose.model('Court', courtSchema);

module.exports = Court;