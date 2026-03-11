const mongoose = require('mongoose');

// Define Schema for Students
const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);
