const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    approveRegistration,
    rejectRegistration,
    generateQRCode,
    markAttendanceViaQR
} = require('../controllers/eventController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes (students can register)
router.post('/:id/register', protect, registerForEvent);
router.post('/:id/attendance/qr', protect, markAttendanceViaQR);

// Admin only routes
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);
router.put('/:id/registrations/:userId/approve', protect, admin, approveRegistration);
router.put('/:id/registrations/:userId/reject', protect, admin, rejectRegistration);
router.get('/:id/qrcode', protect, admin, generateQRCode);

module.exports = router;
