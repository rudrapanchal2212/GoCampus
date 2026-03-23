const asyncHandler = require('express-async-handler');
const Announcement = require('../models/Announcement');

// @desc    Get all active announcements (pinned first, then newest)
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await Announcement.find({ isActive: true })
        .populate('createdBy', 'name')
        .populate('relatedEvent', 'title date')
        .sort({ isPinned: -1, createdAt: -1 });

    res.json(announcements);
});

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = asyncHandler(async (req, res) => {
    const { title, content, type, isPinned, relatedEvent } = req.body;

    const announcement = await Announcement.create({
        title,
        content,
        type: type || 'info',
        isPinned: isPinned || false,
        relatedEvent: relatedEvent || null,
        createdBy: req.user._id
    });

    const populated = await Announcement.findById(announcement._id)
        .populate('createdBy', 'name')
        .populate('relatedEvent', 'title date');

    res.status(201).json(populated);
});

// @desc    Update an announcement (edit, pin/unpin)
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        res.status(404);
        throw new Error('Announcement not found');
    }

    announcement.title = req.body.title !== undefined ? req.body.title : announcement.title;
    announcement.content = req.body.content !== undefined ? req.body.content : announcement.content;
    announcement.type = req.body.type !== undefined ? req.body.type : announcement.type;
    announcement.isPinned = req.body.isPinned !== undefined ? req.body.isPinned : announcement.isPinned;
    announcement.relatedEvent = req.body.relatedEvent !== undefined ? req.body.relatedEvent : announcement.relatedEvent;

    const updated = await announcement.save();
    const populated = await Announcement.findById(updated._id)
        .populate('createdBy', 'name')
        .populate('relatedEvent', 'title date');

    res.json(populated);
});

// @desc    Delete an announcement (soft delete)
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        res.status(404);
        throw new Error('Announcement not found');
    }

    announcement.isActive = false;
    await announcement.save();
    res.json({ message: 'Announcement removed' });
});

module.exports = {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
};
