const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const { startReminderJob } = require('./utils/reminderJob');

dotenv.config();

// Connect to MongoDB
connectDB();

// Start scheduled jobs
startReminderJob();

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json({ limit: '50mb' })); // Parse JSON bodies with larger limit for images
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', eventRoutes);
app.use('/api/venues', require('./routes/venueRoutes'));
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: err.message || 'Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
