const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const QRCode = require('qrcode');

// @desc    Get all events with filtering
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
    const { category, tags, status } = req.query;

    let filter = { isActive: true };

    if (category) {
        filter.category = category;
    }

    if (tags) {
        filter.tags = { $in: tags.split(',') };
    }

    const events = await Event.find(filter)
        .populate('createdBy', 'name email')
        .sort({ date: -1 });

    // Add status filter after fetching (since it's a virtual)
    let filteredEvents = events;
    if (status) {
        filteredEvents = events.filter(event => event.eventStatus === status);
    }

    res.json({ events: filteredEvents, total: filteredEvents.length });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate({
            path: 'registrations.user',
            select: 'name email department profilePhoto'
        })
        .populate('createdBy', 'name email');

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, time, location, organizer, category, tags, registrationLimit, subEvents } = req.body;

    const event = await Event.create({
        title,
        description,
        date,
        time,
        location,
        organizer,
        category: category || 'Other',
        tags: tags || [],
        registrationLimit: registrationLimit || 0,
        subEvents: subEvents || [],
        createdBy: req.user._id
    });

    res.status(201).json(event);
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        event.title = req.body.title || event.title;
        event.description = req.body.description || event.description;
        event.date = req.body.date || event.date;
        event.time = req.body.time || event.time;
        event.location = req.body.location || event.location;
        event.organizer = req.body.organizer || event.organizer;
        event.category = req.body.category || event.category;
        event.tags = req.body.tags || event.tags;
        event.registrationLimit = req.body.registrationLimit !== undefined ? req.body.registrationLimit : event.registrationLimit;
        if (req.body.subEvents !== undefined) {
            event.subEvents = req.body.subEvents;
        }
        event.updatedBy = req.user._id;

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete event (soft delete)
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        event.isActive = false;
        event.updatedBy = req.user._id;
        await event.save();
        res.json({ message: 'Event deleted successfully' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
const registerForEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if already registered
    const alreadyRegistered = event.registrations.find(
        r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
        res.status(400);
        throw new Error('Already registered for this event');
    }

    // Check registration limit
    const approvedCount = event.registrations.filter(r => r.status === 'approved').length;

    if (event.registrationLimit > 0 && approvedCount >= event.registrationLimit) {
        // Add to waiting list
        event.waitingList.push(req.user._id);
        await event.save();
        res.json({ message: 'Event is full. Added to waiting list.', status: 'waiting' });
    } else {
        // Add registration
        event.registrations.push({
            user: req.user._id,
            status: 'pending',
            registeredAt: new Date()
        });
        await event.save();
        res.json({ message: 'Registration submitted. Awaiting admin approval.', status: 'pending' });
    }
});

// @desc    Approve registration
// @route   PUT /api/events/:id/registrations/:userId/approve
// @access  Private/Admin
const approveRegistration = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const registration = event.registrations.find(
        r => r.user.toString() === req.params.userId
    );

    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    registration.status = 'approved';
    registration.approvedAt = new Date();
    registration.approvedBy = req.user._id;

    await event.save();

    const updatedEvent = await Event.findById(req.params.id)
        .populate({
            path: 'registrations.user',
            select: 'name email department profilePhoto'
        });

    res.json({ message: 'Registration approved', event: updatedEvent });
});

// @desc    Reject registration
// @route   PUT /api/events/:id/registrations/:userId/reject
// @access  Private/Admin
const rejectRegistration = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    const registration = event.registrations.find(
        r => r.user.toString() === req.params.userId
    );

    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    registration.status = 'rejected';

    await event.save();

    const updatedEvent = await Event.findById(req.params.id)
        .populate({
            path: 'registrations.user',
            select: 'name email department profilePhoto'
        });

    res.json({ message: 'Registration rejected', event: updatedEvent });
});

// @desc    Generate QR Code for event
// @route   GET /api/events/:id/qrcode
// @access  Private/Admin
const generateQRCode = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // QR Code data: event ID + timestamp for security
    const qrData = JSON.stringify({
        eventId: event._id,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    });

    // Generate QR code as base64
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Save QR code to event
    event.qrCode = qrCodeImage;
    event.qrCodeExpiry = new Date(Date.now() + (24 * 60 * 60 * 1000));
    await event.save();

    res.json({ qrCode: qrCodeImage, expiresAt: event.qrCodeExpiry });
});

// @desc    Mark attendance via QR code
// @route   POST /api/events/:id/attendance/qr
// @access  Private
const markAttendanceViaQR = asyncHandler(async (req, res) => {
    const { qrData } = req.body;

    try {
        const data = JSON.parse(qrData);

        // Verify QR code hasn't expired
        if (data.expiresAt < Date.now()) {
            res.status(400);
            throw new Error('QR Code has expired');
        }

        // Verify event ID matches
        if (data.eventId !== req.params.id) {
            res.status(400);
            throw new Error('Invalid QR Code');
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            res.status(404);
            throw new Error('Event not found');
        }

        // Check if already marked
        const existingAttendance = await Attendance.findOne({
            event: event._id,
            student: req.user._id
        });

        if (existingAttendance) {
            res.status(400);
            throw new Error('Attendance already marked');
        }

        // Mark attendance
        const attendance = await Attendance.create({
            event: event._id,
            student: req.user._id,
            status: 'Present',
            method: 'qr',
            markedAt: new Date()
        });

        res.json({ message: 'Attendance marked successfully via QR', attendance });

    } catch (error) {
        res.status(400);
        throw new Error('Invalid QR Code data');
    }
});

module.exports = {
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
};
