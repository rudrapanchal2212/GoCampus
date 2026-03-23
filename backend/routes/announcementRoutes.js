const express = require('express');
const router = express.Router();
const {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getAnnouncements);
router.post('/', protect, admin, createAnnouncement);
router.put('/:id', protect, admin, updateAnnouncement);
router.delete('/:id', protect, admin, deleteAnnouncement);

module.exports = router;
