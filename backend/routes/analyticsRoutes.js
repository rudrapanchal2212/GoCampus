const express = require('express');
const router = express.Router();
const {
    getDashboardAnalytics,
    getEventsPerMonth,
    getDepartmentParticipation
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// All analytics routes require admin access
router.get('/dashboard', protect, admin, getDashboardAnalytics);
router.get('/events-per-month', protect, admin, getEventsPerMonth);
router.get('/department-participation', protect, admin, getDepartmentParticipation);

module.exports = router;
