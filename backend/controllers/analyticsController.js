const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = asyncHandler(async (req, res) => {
    // Total counts
    const totalEvents = await Event.countDocuments({ isActive: true });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAttendance = await Attendance.countDocuments();

    // Events per month (last 12 months)
    const eventsPerMonth = await Event.aggregate([
        {
            $match: {
                isActive: true,
                date: {
                    $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
                }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ]);

    // Department-wise participation
    const departmentParticipation = await Attendance.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'student',
                foreignField: '_id',
                as: 'studentInfo'
            }
        },
        {
            $unwind: '$studentInfo'
        },
        {
            $group: {
                _id: '$studentInfo.department',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    // Most popular events (by registrations)
    const popularEvents = await Event.aggregate([
        {
            $match: { isActive: true }
        },
        {
            $project: {
                title: 1,
                date: 1,
                category: 1,
                registrationCount: { $size: '$registrations' }
            }
        },
        {
            $sort: { registrationCount: -1 }
        },
        {
            $limit: 5
        }
    ]);

    // Recent activities (last 10)
    const recentActivities = [];

    // Recent events
    const recentEvents = await Event.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title createdAt createdBy')
        .populate('createdBy', 'name');

    recentEvents.forEach(event => {
        recentActivities.push({
            type: 'event_created',
            message: `New event "${event.title}" created`,
            user: event.createdBy?.name || 'Admin',
            timestamp: event.createdAt
        });
    });

    // Recent registrations
    const eventsWithRegistrations = await Event.find({
        'registrations.0': { $exists: true }
    })
        .sort({ 'registrations.registeredAt': -1 })
        .limit(5)
        .populate('registrations.user', 'name')
        .select('title registrations');

    eventsWithRegistrations.forEach(event => {
        const latestReg = event.registrations[event.registrations.length - 1];
        if (latestReg) {
            recentActivities.push({
                type: 'registration',
                message: `${latestReg.user?.name || 'Student'} registered for "${event.title}"`,
                user: latestReg.user?.name || 'Student',
                timestamp: latestReg.registeredAt
            });
        }
    });

    // Sort recent activities by timestamp
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Category distribution
    const categoryDistribution = await Event.aggregate([
        {
            $match: { isActive: true }
        },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ]);

    // Attendance rate
    const totalPossibleAttendance = await Event.aggregate([
        {
            $match: { isActive: true }
        },
        {
            $project: {
                registrationCount: { $size: '$registrations' }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$registrationCount' }
            }
        }
    ]);

    let rawAttendanceRate = totalPossibleAttendance.length > 0 && totalPossibleAttendance[0].total > 0
        ? ((totalAttendance / totalPossibleAttendance[0].total) * 100)
        : 0;
        
    if (rawAttendanceRate > 100) rawAttendanceRate = 100;
    if (rawAttendanceRate < 0) rawAttendanceRate = 0;
    
    const attendanceRate = rawAttendanceRate.toFixed(2);

    res.json({
        summary: {
            totalEvents,
            totalStudents,
            totalAttendance,
            attendanceRate: parseFloat(attendanceRate)
        },
        eventsPerMonth,
        departmentParticipation,
        popularEvents,
        recentActivities: recentActivities.slice(0, 10),
        categoryDistribution
    });
});

// @desc    Get events per month for chart
// @route   GET /api/analytics/events-per-month
// @access  Private/Admin
const getEventsPerMonth = asyncHandler(async (req, res) => {
    const { months = 12 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const eventsPerMonth = await Event.aggregate([
        {
            $match: {
                isActive: true,
                date: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$date' },
                    month: { $month: '$date' }
                },
                count: { $sum: 1 },
                events: { $push: { title: '$title', date: '$date' } }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 }
        }
    ]);

    // Format for frontend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = eventsPerMonth.map(item => ({
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        count: item.count,
        events: item.events
    }));

    res.json(formattedData);
});

// @desc    Get department-wise participation
// @route   GET /api/analytics/department-participation
// @access  Private/Admin
const getDepartmentParticipation = asyncHandler(async (req, res) => {
    const participation = await Attendance.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'student',
                foreignField: '_id',
                as: 'studentInfo'
            }
        },
        {
            $unwind: '$studentInfo'
        },
        {
            $group: {
                _id: '$studentInfo.department',
                totalAttendance: { $sum: 1 },
                uniqueStudents: { $addToSet: '$student' }
            }
        },
        {
            $project: {
                department: '$_id',
                totalAttendance: 1,
                uniqueStudents: { $size: '$uniqueStudents' }
            }
        },
        {
            $sort: { totalAttendance: -1 }
        }
    ]);

    res.json(participation);
});

module.exports = {
    getDashboardAnalytics,
    getEventsPerMonth,
    getDepartmentParticipation
};
