const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'urgent', 'success'],
        default: 'info'
    },
    // optional: pin to top of feed
    isPinned: {
        type: Boolean,
        default: false
    },
    // optional: link to a specific event
    relatedEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
