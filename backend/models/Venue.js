const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['Auditorium', 'Lab', 'Ground', 'Classroom', 'Other'],
        default: 'Other'
    },
    capacity: {
        type: Number,
        required: true
    },
    location: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
