const mongoose = require('mongoose');

// Define the shape/structure of a user document in MongoDB
const userSchema = new mongoose.Schema(
  {
    googleId: {
      // Unique ID that Google gives every user
      type: String,
      required: true,
      unique: true,
    },
    name: {
      // User's full name from Google
      type: String,
      required: true,
    },
    email: {
      // User's Gmail address
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      // Profile picture URL from Google
      type: String,
    },
    role: {
      // Is this a regular user or a court owner?
      type: String,
      enum: ['user', 'court_owner'],  // only these two values allowed
      default: 'user',                // everyone starts as 'user'
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Create the model from schema
// 'User' = collection name in MongoDB (becomes 'users')
const User = mongoose.model('User', userSchema);

module.exports = User;