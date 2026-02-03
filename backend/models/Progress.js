const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    status: {
        type: String,
        enum: ['Started', 'Completed', 'Locked'],
        default: 'Started'
    },
    score: {
        type: Number,
        default: 0
    },
    mistakes: [
        {
            question: String,
            userAnswer: String,
            correctAnswer: String,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    completedAt: {
        type: Date
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Progress', ProgressSchema);
