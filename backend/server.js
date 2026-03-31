const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
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
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', eventRoutes);
app.use('/api/venues', require('./routes/venueRoutes'));
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

// Root route for health check
app.get('/', (req, res) => {
    res.json({ message: 'GoCampus API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    console.error(`[Error] ${req.method} ${req.url} : ${err.message}`);
    res.status(statusCode).json({
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
