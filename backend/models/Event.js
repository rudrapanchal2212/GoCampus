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
    endTime: {
        type: String
    },
    location: {
        type: String, // Kept as fallback or specific instruction, but venue is used for booking
        required: true
    },
    venue: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue'
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
    isTeamEvent: {
        type: Boolean,
        default: false
    },
    minTeamSize: {
        type: Number,
        default: 1
    },
    maxTeamSize: {
        type: Number,
        default: 1
    },
    registrations: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        teamName: String,
        teamMembers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
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
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
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
    return this.registrations ? this.registrations.filter(r => r.status === 'approved').length : 0;
});

// Virtual for pending count
EventSchema.virtual('pendingCount').get(function () {
    return this.registrations ? this.registrations.filter(r => r.status === 'pending').length : 0;
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

// Virtual for average rating
EventSchema.virtual('averageRating').get(function () {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
});

// Ensure virtuals are included in JSON
EventSchema.set('toJSON', { virtuals: true });
EventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', EventSchema);
