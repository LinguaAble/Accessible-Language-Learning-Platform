const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // Story 8: Default ADHD-friendly settings applied automatically
  preferences: {
    theme: { type: String, default: 'minimalist' }, // Distraction-free by default
    soundEffects: { type: Boolean, default: false }, // Quiet by default
    animationReduced: { type: Boolean, default: true }, // No moving distractions
    sessionDuration: { type: Number, default: 15 } // Short 15-min sessions
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);