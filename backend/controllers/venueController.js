const asyncHandler = require('express-async-handler');
const Venue = require('../models/Venue');

// @desc    Get all active venues
// @route   GET /api/venues
// @access  Public or Private
const getVenues = asyncHandler(async (req, res) => {
    const venues = await Venue.find({ isActive: true });
    res.json(venues);
});

// @desc    Create a new venue
// @route   POST /api/venues
// @access  Private/Admin
const createVenue = asyncHandler(async (req, res) => {
    const { name, type, capacity, location } = req.body;

    const venueExists = await Venue.findOne({ name });
    if (venueExists) {
        res.status(400);
        throw new Error('Venue already exists');
    }

    const venue = await Venue.create({
        name,
        type: type || 'Other',
        capacity,
        location: location || ''
    });

    if (venue) {
        res.status(201).json(venue);
    } else {
        res.status(400);
        throw new Error('Invalid venue data');
    }
});

// @desc    Update a venue
// @route   PUT /api/venues/:id
// @access  Private/Admin
const updateVenue = asyncHandler(async (req, res) => {
    const venue = await Venue.findById(req.params.id);

    if (venue) {
        venue.name = req.body.name || venue.name;
        venue.type = req.body.type || venue.type;
        venue.capacity = req.body.capacity !== undefined ? req.body.capacity : venue.capacity;
        venue.location = req.body.location || venue.location;
        venue.isActive = req.body.isActive !== undefined ? req.body.isActive : venue.isActive;

        const updatedVenue = await venue.save();
        res.json(updatedVenue);
    } else {
        res.status(404);
        throw new Error('Venue not found');
    }
});

// @desc    Delete a venue
// @route   DELETE /api/venues/:id
// @access  Private/Admin
const deleteVenue = asyncHandler(async (req, res) => {
    const venue = await Venue.findById(req.params.id);

    if (venue) {
        venue.isActive = false; // soft delete
        await venue.save();
        res.json({ message: 'Venue removed' });
    } else {
        res.status(404);
        throw new Error('Venue not found');
    }
});

module.exports = {
    getVenues,
    createVenue,
    updateVenue,
    deleteVenue
};
