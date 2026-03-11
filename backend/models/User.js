const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    department: {
        type: String,
        required: false
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    // Student Profile Fields (mandatory for students)
    enrollmentNo: {
        type: String,
        sparse: true,
        unique: true
    },
    phoneNumber: {
        type: String
    },
    aadhaarCard: {
        type: String
    },
    fullName: {
        type: String
    },
    profilePhoto: {
        type: String // URL or base64 encoded image
    },
    profileCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
