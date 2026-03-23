const express = require('express');
const router = express.Router();
const { getVenues, createVenue, updateVenue, deleteVenue } = require('../controllers/venueController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getVenues);
router.post('/', protect, admin, createVenue);
router.put('/:id', protect, admin, updateVenue);
router.delete('/:id', protect, admin, deleteVenue);

module.exports = router;
