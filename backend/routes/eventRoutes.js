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
    addEventReview,
    approveEvent,
    rejectEvent
} = require('../controllers/eventController');
const { protect, admin, adminOrCoordinator } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes (students can register & review)
router.post('/:id/register', protect, registerForEvent);
router.post('/:id/reviews', protect, addEventReview);

// Admin or Coordinator routes
router.post('/', protect, adminOrCoordinator, createEvent);
router.put('/:id', protect, adminOrCoordinator, updateEvent);
router.delete('/:id', protect, adminOrCoordinator, deleteEvent);
router.put('/:id/registrations/:userId/approve', protect, adminOrCoordinator, approveRegistration);
router.put('/:id/registrations/:userId/reject', protect, adminOrCoordinator, rejectRegistration);

// Admin only routes for event approval
router.put('/:id/approve', protect, admin, approveEvent);
router.put('/:id/reject', protect, admin, rejectEvent);

module.exports = router;
