const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  duration: {
    type: Number, // In minutes
    required: true
  },
  estimatedTime: {
    type: String // e.g., "5 mins"
  },
  content: {
    type: String, // could be text, html, or a link to resource
    required: true
  },
  type: {
    type: String,
    enum: ['Reading', 'Listening', 'Speaking', 'Grammar'],
    default: 'Reading'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lesson', LessonSchema);
