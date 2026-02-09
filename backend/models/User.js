const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  username: {
    type: String,
    required: false,
    default: ''
  },
  fullName: {
    type: String,
    required: false,
    default: ''
  },
  age: {
    type: Number,
    required: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say', ''],
    default: ''
  },
  bio: {
    type: String,
    required: false,
    default: '',
    maxlength: 500
  },
  avatarUrl: {
    type: String,
    required: false,
    default: ''
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
    theme: { type: String, default: 'dark' },
    soundEffects: { type: Boolean, default: false },
    animationReduced: { type: Boolean, default: false },
    fontSize: { type: String, default: 'medium' },
    dailyGoalMinutes: { type: Number, default: 5 }
  },

  // Story: Track User Progress
  completedLessons: {
    type: [Number],
    default: []
  },

  // Daily progress tracking
  todayProgress: {
    type: Number,
    default: 0
  },
  progressDate: {
    type: String,
    default: () => new Date().toDateString()
  },

  // Daily lesson counts (for weekly chart)
  dailyLessonCounts: [{
    date: { type: String, required: true },
    count: { type: Number, default: 0 }
  }],

  // Story: Login History
  loginHistory: [{
    timestamp: { type: Date, default: Date.now },
    device: { type: String, default: 'Web Browser' }
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);