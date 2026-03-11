const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendance,
    getStudentAttendancePercentage,
    getEventAttendanceStats,
    exportAttendanceCSV,
    bulkMarkAttendance
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require authentication
router.post('/', protect, admin, markAttendance);
router.get('/', protect, getAttendance);
router.post('/bulk', protect, admin, bulkMarkAttendance);
router.get('/export/csv', protect, admin, exportAttendanceCSV);
router.get('/student/:studentId/percentage', protect, getStudentAttendancePercentage);
router.get('/event/:eventId/stats', protect, getEventAttendanceStats);

module.exports = router;
