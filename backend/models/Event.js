const mongoose = require('mongoose');

// Define Schema for Events
const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    organizer: {
        type: String,
        required: true
    },
    subEvents: [{
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        time: {
            type: String
        },
        location: {
            type: String
        }
    }],
    category: {
        type: String,
        enum: ['Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Other'],
        default: 'Other'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    registrationLimit: {
        type: Number,
        default: 0 // 0 means unlimited
    },
    registrations: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        approvedAt: Date,
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    waitingList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    qrCode: {
        type: String // Base64 encoded QR code
    },
    qrCodeExpiry: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Virtual for registration count
EventSchema.virtual('registrationCount').get(function () {
    return this.registrations.filter(r => r.status === 'approved').length;
});

// Virtual for pending count
EventSchema.virtual('pendingCount').get(function () {
    return this.registrations.filter(r => r.status === 'pending').length;
});

// Virtual for event status
EventSchema.virtual('eventStatus').get(function () {
    const now = new Date();
    const eventDate = new Date(this.date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    if (eventDay.getTime() === today.getTime()) {
        return 'today';
    } else if (eventDate > now) {
        return 'upcoming';
    } else {
        return 'past';
    }
});

// Ensure virtuals are included in JSON
EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', EventSchema);
