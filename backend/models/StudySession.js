const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    date: {
        type: String, // Format YYYY-MM-DD for easier daily aggregation
        required: true
    }
});

module.exports = mongoose.model('StudySession', StudySessionSchema);
