const mongoose = require('mongoose');

// Define Schema for Attendance
const AttendanceSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Changed from Student to User
        required: true
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late'],
        default: 'Present'
    },
    session: {
        type: String, // e.g., "Morning", "Afternoon", "Day 1", "Day 2"
        default: 'General'
    },
    markedAt: {
        type: Date,
        default: Date.now
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin who marked attendance
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
AttendanceSchema.index({ event: 1, student: 1, session: 1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
