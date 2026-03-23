const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');
const {
    sendRegistrationApprovedEmail,
    sendEventUpdateEmail
} = require('../utils/emailService');

// @desc    Get all events with filtering
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
    const { category, tags, status } = req.query;

    let filter = { isActive: true, isApproved: true };

    // Check if user is logged in
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            const currentUser = await User.findById(decoded.id).select('role _id');
            
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'coordinator')) {
                filter = { isActive: true }; // Admins and coordinators see all
            }
        } catch (error) {
            // Invalid token, ignore and just show approved events
        }
    }

    if (category) {
        filter.category = category;
    }

    if (tags) {
        filter.tags = { $in: tags.split(',') };
    }

    const events = await Event.find(filter)
        .populate('createdBy', 'name email')
        .populate('reviews.user', 'name')
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
        .populate({
            path: 'registrations.teamMembers',
            select: 'name email department profilePhoto'
        })
        .populate('createdBy', 'name email')
        .populate('reviews.user', 'name');

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/);
    if (!match) return 0;
    let [ , h, m, period ] = match;
    h = parseInt(h);
    m = parseInt(m);
    if (period) {
        if (period.toLowerCase() === 'pm' && h < 12) h += 12;
        if (period.toLowerCase() === 'am' && h === 12) h = 0;
    }
    return h * 60 + m;
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin or Coordinator
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, time, endTime, location, venue, organizer, category, tags, registrationLimit, subEvents, isTeamEvent, minTeamSize, maxTeamSize } = req.body;

    if (venue) {
        const eventDateStr = new Date(date).toISOString().split('T')[0];
        const existingEvents = await Event.find({ venue, isActive: true });
        const newStart = parseTime(time);
        const newEnd = parseTime(endTime);

        for (let existing of existingEvents) {
            const extDateStr = new Date(existing.date).toISOString().split('T')[0];
            if (extDateStr === eventDateStr) {
                const extStart = parseTime(existing.time);
                const extEnd = existing.endTime ? parseTime(existing.endTime) : (extStart + 60); // assume 1 hour if no end time
                
                if (newStart < extEnd && newEnd > extStart) {
                    res.status(400);
                    throw new Error('Venue is already double-booked for this time slot');
                }
            }
        }
    }

    const isApproved = (req.user.role === 'admin' || req.user.role === 'coordinator');

    const event = await Event.create({
        title,
        description,
        date,
        time,
        endTime,
        location,
        venue: venue || null,
        organizer,
        category: category || 'Other',
        tags: tags || [],
        registrationLimit: registrationLimit || 0,
        subEvents: subEvents || [],
        isTeamEvent: isTeamEvent || false,
        minTeamSize: minTeamSize || 1,
        maxTeamSize: maxTeamSize || 1,
        createdBy: req.user._id,
        isApproved
    });

    res.status(201).json(event);
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin or Coordinator
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        if (req.user.role !== 'admin' && req.user.role !== 'coordinator' && event.createdBy.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('You are not authorized to update this event');
        }

        const newDate = req.body.date || event.date;
        const newTime = req.body.time || event.time;
        const newEndTime = req.body.endTime || event.endTime;
        const newVenue = req.body.venue !== undefined ? req.body.venue : event.venue;

        if (newVenue) {
            const eventDateStr = new Date(newDate).toISOString().split('T')[0];
            const existingEvents = await Event.find({ 
                venue: newVenue, 
                isActive: true,
                _id: { $ne: event._id }
            });
            const newStart = parseTime(newTime);
            const newEnd = parseTime(newEndTime);

            for (let existing of existingEvents) {
                const extDateStr = new Date(existing.date).toISOString().split('T')[0];
                if (extDateStr === eventDateStr) {
                    const extStart = parseTime(existing.time);
                    const extEnd = existing.endTime ? parseTime(existing.endTime) : (extStart + 60);
                    
                    if (newStart < extEnd && newEnd > extStart) {
                        res.status(400);
                        throw new Error('Venue is already double-booked for this time slot');
                    }
                }
            }
        }

        // ── track important changes for notification
        const importantChanges = [];
        const oldDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const newDateFormatted = new Date(newDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        if (oldDate !== newDateFormatted) importantChanges.push({ field: 'Date', old: oldDate, new: newDateFormatted });
        if (event.time !== newTime) importantChanges.push({ field: 'Start Time', old: event.time, new: newTime });
        if (event.endTime !== newEndTime && newEndTime) importantChanges.push({ field: 'End Time', old: event.endTime || '—', new: newEndTime });
        const oldLoc = req.body.location || event.location;
        if (req.body.location && req.body.location !== event.location) importantChanges.push({ field: 'Location', old: event.location, new: req.body.location });
        const oldVenueId = event.venue ? event.venue.toString() : null;
        const newVenueId = newVenue ? (typeof newVenue === 'object' ? newVenue.toString() : newVenue) : null;
        if (oldVenueId !== newVenueId) importantChanges.push({ field: 'Venue', old: 'Previous venue', new: 'Updated venue — check event page' });

        event.title = req.body.title || event.title;
        event.description = req.body.description || event.description;
        event.date = newDate;
        event.time = newTime;
        event.endTime = newEndTime;
        event.location = req.body.location || event.location;
        event.venue = newVenue || null;
        if (req.body.venue === '') event.venue = null; // allow clearing venue
        event.organizer = req.body.organizer || event.organizer;
        event.category = req.body.category || event.category;
        event.tags = req.body.tags || event.tags;
        event.registrationLimit = req.body.registrationLimit !== undefined ? req.body.registrationLimit : event.registrationLimit;
        event.isTeamEvent = req.body.isTeamEvent !== undefined ? req.body.isTeamEvent : event.isTeamEvent;
        event.minTeamSize = req.body.minTeamSize !== undefined ? req.body.minTeamSize : event.minTeamSize;
        event.maxTeamSize = req.body.maxTeamSize !== undefined ? req.body.maxTeamSize : event.maxTeamSize;
        if (req.body.subEvents !== undefined) {
            event.subEvents = req.body.subEvents;
        }
        event.updatedBy = req.user._id;

        const updatedEvent = await event.save();

        // ── fire change alerts to all approved registrants (non-blocking)
        if (importantChanges.length > 0) {
            const populated = await Event.findById(updatedEvent._id).populate({
                path: 'registrations.user',
                select: 'name email'
            });
            const approvedUsers = (populated.registrations || [])
                .filter(r => r.status === 'approved' && r.user?.email);
            for (const reg of approvedUsers) {
                sendEventUpdateEmail({ student: reg.user, event: updatedEvent, changes: importantChanges })
                    .catch(e => console.error('[updateEvent] Email error:', e.message));
            }
        }

        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete event (soft delete)
// @route   DELETE /api/events/:id
// @access  Private/Admin or Coordinator
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        if (req.user.role !== 'admin' && req.user.role !== 'coordinator' && event.createdBy.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('You are not authorized to delete this event');
        }

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
    const { teamName, teamMembers } = req.body;

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    let usersToRegister = [req.user._id.toString()];
    
    // Team validation
    if (event.isTeamEvent) {
        if (!teamName) {
            res.status(400);
            throw new Error('Team name is required for team events.');
        }
        
        const memberIds = Array.isArray(teamMembers) ? teamMembers : [];
        if (memberIds.length + 1 < event.minTeamSize || memberIds.length + 1 > event.maxTeamSize) {
            res.status(400);
            throw new Error(`Team size must be between ${event.minTeamSize} and ${event.maxTeamSize} members (including you).`);
        }
        
        usersToRegister = [...usersToRegister, ...memberIds];
    }

    // Check if already registered
    const alreadyRegistered = event.registrations.find(r => {
        const regUserIds = [r.user.toString(), ...(r.teamMembers || []).map(m => m.toString())];
        return usersToRegister.some(userId => regUserIds.includes(userId));
    });

    if (alreadyRegistered) {
        res.status(400);
        throw new Error('You or one of your team members are already registered for this event');
    }

    // Check registration limit
    const approvedCount = event.registrations.filter(r => r.status === 'approved').length;

    let registrationObj = {
        user: req.user._id,
        status: 'pending',
        registeredAt: new Date()
    };

    if (event.isTeamEvent) {
        registrationObj.teamName = teamName;
        registrationObj.teamMembers = Array.isArray(teamMembers) ? teamMembers : [];
    }

    if (event.registrationLimit > 0 && approvedCount >= event.registrationLimit) {
        // Add to waiting list
        event.waitingList.push(req.user._id);
        await event.save();
        res.json({ message: 'Event is full. Added to waiting list.', status: 'waiting' });
    } else {
        // Add registration
        event.registrations.push(registrationObj);
        await event.save();
        res.json({ message: 'Registration submitted. Awaiting approval.', status: 'pending' });
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
        })
        .populate({
            path: 'registrations.teamMembers',
            select: 'name email department profilePhoto'
        });

    // Send approval email to registered student + team members
    try {
        const approvedReg = updatedEvent.registrations.find(
            r => r.user && r.user._id.toString() === req.params.userId
        );
        if (approvedReg?.user?.email) {
            const recipients = [approvedReg.user];
            // Also notify team members
            if (approvedReg.teamMembers && approvedReg.teamMembers.length > 0) {
                recipients.push(...approvedReg.teamMembers.filter(m => m?.email));
            }
            for (const recipient of recipients) {
                await sendRegistrationApprovedEmail({ student: recipient, event: updatedEvent });
            }
        }
    } catch (emailErr) {
        console.error('[approveRegistration] Email error:', emailErr.message);
    }

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

// @desc    Add event review
// @route   POST /api/events/:id/reviews
// @access  Private
const addEventReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if user already reviewed
    const alreadyReviewed = event.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('You have already reviewed this event');
    }

    // Optional: check if event is past
    const now = new Date();
    const eventDate = new Date(event.date);
    if (eventDate > now) {
        res.status(400);
        throw new Error('You can only review an event after it has passed');
    }

    // Optional: check if user attended the event
    const attendance = await Attendance.findOne({
        event: event._id,
        student: req.user._id,
        status: 'Present'
    });

    if (!attendance) {
        res.status(400);
        throw new Error('You must have attended the event to review it');
    }

    const review = {
        user: req.user._id,
        rating: Number(rating),
        comment
    };

    event.reviews.push(review);

    await event.save();

    res.status(201).json({ message: 'Review added successfully' });
});



const approveEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    event.isApproved = true;
    event.updatedBy = req.user._id;
    await event.save();

    res.json({ message: 'Event proposal approved', event });
});

// @desc    Reject event proposal
// @route   PUT /api/events/:id/reject
// @access  Private/Admin
const rejectEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Rather than deleting, maybe set isActive false or keep isApproved false with a rejected status
    // Here we'll just soft delete the rejected event proposal
    event.isActive = false;
    event.updatedBy = req.user._id;
    await event.save();

    res.json({ message: 'Event proposal rejected (deleted)', event });
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
    addEventReview,
    approveEvent,
    rejectEvent
};
