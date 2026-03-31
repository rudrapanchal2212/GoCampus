const fs = require('fs');

// Helpers
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const generateId = () => {
    return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Ananya', 'Aadhya', 'Kiara', 'Diya', 'Pari', 'Saanvi', 'Riya', 'Isha', 'Myra', 'Aarohi', 'Neha', 'Priya', 'Rohan', 'Amit', 'Sunil', 'Karan', 'Sneha', 'Pooja', 'Anjali', 'Kriti', 'Rahul'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Das', 'Roy', 'Mehta', 'Jain', 'Shah', 'Nair', 'Pillai', 'Rao', 'Reddy', 'Chauhan', 'Yadav', 'Mishra', 'Pandey', 'Tiwari'];
const venuesDataList = [
    { name: 'Main Auditorium', type: 'Auditorium', capacity: 1000 },
    { name: 'Seminar Hall 1', type: 'Other', capacity: 200 },
    { name: 'Computer Lab 1', type: 'Lab', capacity: 60 },
    { name: 'Ground A', type: 'Ground', capacity: 5000 },
    { name: 'Classroom 101', type: 'Classroom', capacity: 100 },
    { name: 'Conference Room', type: 'Other', capacity: 50 }
];

const eventTitles = ['Tech Symposium', 'Cultural Night', 'Sports Meet', 'Alumni Meet', 'Job Fair', 'Hackathon', 'Coding Competiton', 'Debate Competition', 'Music Concert', 'Art Exhibition', 'Science Fair', 'Robotics Workshop', 'AI Seminar', 'Web Dev Bootcamp', 'Cyber Security Talk', 'Entrepreneurship Summit'];
const categories = ['Workshop', 'Seminar', 'Sports', 'Cultural', 'Technical', 'Other'];

// 1. Generate Venues
const venues = venuesDataList.map(v => ({
    _id: generateId(),
    name: v.name,
    type: v.type,
    capacity: v.capacity,
    location: `Block ${randomItem(['A', 'B', 'C'])}`,
    isActive: true
}));

// 2. Generate Users (Students + Coordinators)
const users = [];
// 10 Admins/Coordinators
for (let i = 0; i < 10; i++) {
    const fn = randomItem(firstNames);
    const ln = randomItem(lastNames);
    users.push({
        _id: generateId(),
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@gocampus.edu`,
        password: '$2a$10$hashedpassword', // Dummy hash
        department: randomItem(departments),
        role: i < 3 ? 'admin' : 'coordinator',
        profileCompleted: true
    });
}

// 500 Students
// format "123021305010xx" requested in previous history
let baseEnrollment = 12302130501000;
for (let i = 0; i < 500; i++) {
    const fn = randomItem(firstNames);
    const ln = randomItem(lastNames);
    baseEnrollment++;
    users.push({
        _id: generateId(),
        name: `${fn} ${ln}`,
        email: `student${i}@gocampus.edu`,
        password: '$2a$10$hashedpassword', // Dummy config representation
        department: randomItem(departments),
        role: 'student',
        enrollmentNo: String(baseEnrollment),
        phoneNumber: `98765${String(Math.floor(Math.random() * 90000) + 10000)}`,
        profileCompleted: true
    });
}

const students = users.filter(u => u.role === 'student');
const coordinators = users.filter(u => u.role !== 'student');

// 3. Generate 50 Events
const events = [];
const currentYear = new Date().getFullYear();
const startOfYear = new Date(currentYear, 0, 1);
const endOfYear = new Date(currentYear, 11, 31);

for (let i = 0; i < 50; i++) {
    const isUpcoming = Math.random() > 0.6; // 40% past, 60% upcoming
    const eDate = isUpcoming ? randomDate(new Date(), endOfYear) : randomDate(startOfYear, new Date());
    const venue = randomItem(venues);
    
    // Pick 20-200 random registrations depending on capacity
    const numRegs = randomInt(20, Math.min(venue.capacity, 200));
    const registeredIndices = new Set();
    while (registeredIndices.size < numRegs) {
        registeredIndices.add(randomInt(0, students.length - 1));
    }
    
    const registrations = Array.from(registeredIndices).map(idx => ({
        user: students[idx]._id,
        status: Math.random() > 0.1 ? 'approved' : 'pending',
        registeredAt: new Date(eDate.getTime() - randomInt(1, 10)*24*60*60*1000),
        approvedAt: isUpcoming ? undefined : new Date(eDate.getTime() - randomInt(1, 5)*24*60*60*1000),
        approvedBy: randomItem(coordinators)._id
    }));
    
    events.push({
        _id: generateId(),
        title: `${randomItem(eventTitles)} ${currentYear} Edition ${i + 1}`,
        description: `This is a highly anticipated event focusing on the dynamic fields of technology and culture. Join us for an informative and exciting experience.`,
        date: eDate,
        time: `${randomInt(9, 15).toString().padStart(2, '0')}:00`,
        endTime: `${randomInt(16, 20).toString().padStart(2, '0')}:00`,
        location: venue.name,
        venue: venue._id,
        organizer: randomItem(coordinators).name,
        category: randomItem(categories),
        tags: ['campus', 'student', 'annual'],
        registrationLimit: venue.capacity,
        registrations: registrations,
        subEvents: [
            {
                title: 'Opening Ceremony',
                time: '10:00',
                location: venue.name
            },
            {
                title: 'Main Session',
                time: '11:00',
                location: venue.name
            }
        ],
        isActive: true,
        isApproved: true,
        createdBy: randomItem(coordinators)._id
    });
}

// 4. Generate Attendance
const attendances = [];
// Only generate attendance for PAST events
const pastEvents = events.filter(e => e.date < new Date());
pastEvents.forEach(e => {
    // Only approved registrations attend
    const attendees = e.registrations.filter(r => r.status === 'approved');
    attendees.forEach(reg => {
        // Generate separate attendance for subEvent sessions or General
        ['Morning', 'Afternoon'].forEach(session => {
             // 85% attendance rate
            const isPresent = Math.random() < 0.85;
            attendances.push({
                _id: generateId(),
                event: e._id,
                student: reg.user,
                status: isPresent ? 'Present' : 'Absent',
                session: session,
                markedAt: new Date(e.date.getTime() + 2*60*60*1000),
                markedBy: randomItem(coordinators)._id
            });
        });
    });
});

// 5. Generate Notices (Announcements)
const announcements = [];
for (let i = 0; i < 20; i++) {
    announcements.push({
        _id: generateId(),
        title: `Notice Regarding ${randomItem(eventTitles)}`,
        content: `Please be informed about the upcoming changes and guidelines relating to our schedule.`,
        type: randomItem(['info', 'warning', 'urgent', 'success']),
        isPinned: Math.random() > 0.8,
        isActive: true,
        createdBy: randomItem(coordinators)._id,
        createdAt: randomDate(startOfYear, new Date())
    });
}

// 6. Generate Analytics Summary
const totalStudents = students.length;
const totalEvents = events.length;
const upcomingEventsCount = events.filter(e => e.date > new Date()).length;
const pastEventsCount = events.length - upcomingEventsCount;
const totalRegistrations = events.reduce((acc, evt) => acc + evt.registrations.length, 0);

// Registration/student by department
const studentByDepartment = {};
students.forEach(s => {
    studentByDepartment[s.department] = (studentByDepartment[s.department] || 0) + 1;
});

const recentActivities = events
    .sort((a, b) => b.date - a.date)
    .slice(0, 10)
    .map(e => ({
        id: generateId(),
        action: `Event "${e.title}" was ${e.date > new Date() ? 'scheduled' : 'held'}`,
        date: e.date,
        type: 'event'
    }));

// Also add notices to recent activities
announcements.slice(0, 5).forEach(a => {
    recentActivities.push({
        id: generateId(),
        action: `Notice posted: ${a.title}`,
        date: a.createdAt,
        type: 'notice'
    });
});

// Calculate attendance chart data (mock percentages by category)
const attendanceChartData = categories.map(cat => ({
    name: cat,
    rate: Math.floor(Math.random() * 40) + 50 // 50-90%
}));

const dashboardAnalytics = {
    metrics: {
        totalStudents,
        totalEvents,
        upcomingEvents: upcomingEventsCount,
        pastEventsCount,
        totalRegistrations,
    },
    studentByDepartment,
    attendanceChartData,
    recentActivities: recentActivities.sort((a, b) => b.date - a.date).slice(0, 15)
};

const finalData = {
    users,
    venues,
    events,
    attendances,
    announcements,
    dashboardAnalytics
};

fs.writeFileSync('large-scale-campus-data.json', JSON.stringify(finalData, null, 2));
console.log(`Successfully generated data.json for ${users.length} users, ${events.length} events, ${attendances.length} attendances, with full analytics and charts.`);
