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

  // --- NEW: Password Reset Fields ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // ----------------------------------

  // Story 8: Default ADHD-friendly settings applied automatically
  preferences: {
    theme: { type: String, default: 'minimalist' },
    soundEffects: { type: Boolean, default: false },
    animationReduced: { type: Boolean, default: true },
    sessionDuration: { type: Number, default: 15 }
  },
  completedLessons: {
    type: [Number],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);