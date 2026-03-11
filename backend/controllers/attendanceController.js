const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');
const { Parser } = require('json2csv');

// @desc    Mark attendance (manual)
// @route   POST /api/attendance
// @access  Private/Admin
const markAttendance = asyncHandler(async (req, res) => {
    const { event, student, enrollmentNo, status, session, notes } = req.body;

    let studentId = student;

    // If enrollment number provided, find student by enrollment number
    if (!studentId && enrollmentNo) {
        const studentUser = await User.findOne({ enrollmentNo });
        if (!studentUser) {
            res.status(404);
            throw new Error(`Student with Enrollment No: ${enrollmentNo} not found`);
        }
        studentId = studentUser._id;
    }

    if (!studentId) {
        res.status(400);
        throw new Error('Please provide student ID or Enrollment Number');
    }

    // Check if attendance already exists for this session
    const existingAttendance = await Attendance.findOne({
        event,
        student: studentId,
        session: session || 'General'
    });

    if (existingAttendance) {
        // Update existing attendance
        existingAttendance.status = status;
        existingAttendance.notes = notes;
        existingAttendance.markedBy = req.user._id;
        existingAttendance.markedAt = new Date();
        await existingAttendance.save();

        const populated = await Attendance.findById(existingAttendance._id)
            .populate('student', 'name email department profilePhoto enrollmentNo')
            .populate('event', 'title date');

        res.json(populated);
    } else {
        // Create new attendance record
        const attendance = await Attendance.create({
            event,
            student: studentId,
            status,
            session: session || 'General',
            notes,
            markedBy: req.user._id,
            method: 'manual'
        });

        const populated = await Attendance.findById(attendance._id)
            .populate('student', 'name email department profilePhoto enrollmentNo')
            .populate('event', 'title date');

        res.status(201).json(populated);
    }
});

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
const getAttendance = asyncHandler(async (req, res) => {
    const { event, student, session } = req.query;

    let filter = {};

    if (event) filter.event = event;
    if (student) filter.student = student;
    if (session) filter.session = session;

    const attendance = await Attendance.find(filter)
        .populate('student', 'name email department enrollmentNo profilePhoto')
        .populate('event', 'title date location')
        .populate('markedBy', 'name')
        .sort({ markedAt: -1 });

    res.json(attendance);
});

// @desc    Get attendance percentage for a student
// @route   GET /api/attendance/student/:studentId/percentage
// @access  Private
const getStudentAttendancePercentage = asyncHandler(async (req, res) => {
    const studentId = req.params.studentId;

    // Get all attendance records for this student
    const attendanceRecords = (await Attendance.find({ student: studentId })
        .populate('event', 'title date')) || [];

    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(a => a.status === 'Present').length;
    const late = attendanceRecords.filter(a => a.status === 'Late').length;
    const absent = attendanceRecords.filter(a => a.status === 'Absent').length;

    const percentage = total > 0 ? ((present + late) / total * 100).toFixed(2) : 0;

    res.json({
        studentId,
        total,
        present,
        late,
        absent,
        percentage: parseFloat(percentage),
        records: attendanceRecords
    });
});

// @desc    Get attendance statistics for an event
// @route   GET /api/attendance/event/:eventId/stats
// @access  Private/Admin
const getEventAttendanceStats = asyncHandler(async (req, res) => {
    const eventId = req.params.eventId;

    const attendanceRecords = (await Attendance.find({ event: eventId })
        .populate('student', 'name email department')) || [];

    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(a => a.status === 'Present').length;
    const late = attendanceRecords.filter(a => a.status === 'Late').length;
    const absent = attendanceRecords.filter(a => a.status === 'Absent').length;

    // Group by session
    const sessionStats = {};
    attendanceRecords.forEach(record => {
        if (!sessionStats[record.session]) {
            sessionStats[record.session] = {
                total: 0,
                present: 0,
                late: 0,
                absent: 0
            };
        }
        sessionStats[record.session].total++;
        sessionStats[record.session][record.status.toLowerCase()]++;
    });

    res.json({
        eventId,
        overall: {
            total,
            present,
            late,
            absent,
            percentage: total > 0 ? ((present + late) / total * 100).toFixed(2) : 0
        },
        sessions: sessionStats,
        records: attendanceRecords
    });
});

// @desc    Export attendance to CSV
// @route   GET /api/attendance/export/csv
// @access  Private/Admin
const exportAttendanceCSV = asyncHandler(async (req, res) => {
    const { event } = req.query;

    let filter = {};
    if (event) filter.event = event;

    const attendance = await Attendance.find(filter)
        .populate('student', 'name email department enrollmentNo')
        .populate('event', 'title date location')
        .sort({ markedAt: -1 });

    // Transform data for CSV
    const data = attendance.map(record => ({
        'Student Name': record.student?.name || 'N/A',
        'Email': record.student?.email || 'N/A',
        'Enrollment No': record.student?.enrollmentNo || 'N/A',
        'Department': record.student?.department || 'N/A',
        'Event': record.event?.title || 'N/A',
        'Event Date': record.event?.date ? new Date(record.event.date).toLocaleDateString() : 'N/A',
        'Session': record.session,
        'Status': record.status,
        'Marked At': new Date(record.markedAt).toLocaleString(),
        'Method': record.method,
        'Notes': record.notes || ''
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename=attendance_${Date.now()}.csv`);
    res.send(csv);
});

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private/Admin
const bulkMarkAttendance = asyncHandler(async (req, res) => {
    const { event, students, status, session } = req.body;

    const attendanceRecords = [];

    for (const studentId of students) {
        const existing = await Attendance.findOne({
            event,
            student: studentId,
            session: session || 'General'
        });

        if (existing) {
            existing.status = status;
            existing.markedBy = req.user._id;
            existing.markedAt = new Date();
            await existing.save();
            attendanceRecords.push(existing);
        } else {
            const attendance = await Attendance.create({
                event,
                student: studentId,
                status,
                session: session || 'General',
                markedBy: req.user._id,
                method: 'manual'
            });
            attendanceRecords.push(attendance);
        }
    }

    res.json({
        message: `Marked attendance for ${attendanceRecords.length} students`,
        count: attendanceRecords.length
    });
});

module.exports = {
    markAttendance,
    getAttendance,
    getStudentAttendancePercentage,
    getEventAttendanceStats,
    exportAttendanceCSV,
    bulkMarkAttendance
};
