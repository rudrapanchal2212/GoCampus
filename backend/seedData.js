const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const User = require('./models/User');
const Venue = require('./models/Venue');
const Event = require('./models/Event');
const Announcement = require('./models/Announcement');
const Attendance = require('./models/Attendance');

// Connect Database using standard Mongoose connect
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus_event_db');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        console.log('Clearing old fake seed data... (only deleting our specific fake data to avoid affecting existing users/data)');

        // Pre-clean only documents with a specific identifying domain or prefix to be safe
        await User.deleteMany({ email: { $regex: '@fakeuniversity.edu' } });
        await Venue.deleteMany({ name: { $regex: 'Fake Venue' } });
        await Event.deleteMany({ title: { $regex: 'Fake Event' } });
        await Announcement.deleteMany({ title: { $regex: 'Fake Announcement' } });

        console.log('Seeding Venues...');
        const venues = [
            { name: 'Fake Venue - Main Auditorium', type: 'Auditorium', capacity: 500, location: 'Building A' },
            { name: 'Fake Venue - Alpha Lab', type: 'Lab', capacity: 50, location: 'Building B' },
            { name: 'Fake Venue - Open Ground', type: 'Ground', capacity: 1000, location: 'Campus Center' }
        ];
        const createdVenues = await Venue.insertMany(venues);

        console.log('Seeding Admin/Coordinator...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const adminUser = await User.create({
            name: 'Fake Admin',
            email: 'admin@fakeuniversity.edu',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Seeding Students...');
        const studentsToInsert = [];
        for (let i = 1; i <= 15; i++) {
            // Format 123021305010xx
            const suffix = i < 10 ? `0${i}` : `${i}`;
            const enrollmentNo = `123021305010${suffix}`;
            
            studentsToInsert.push({
                name: `Fake Student ${i}`,
                email: `student${i}@fakeuniversity.edu`,
                password: hashedPassword,
                role: 'student',
                department: 'Computer Engineering',
                enrollmentNo: enrollmentNo,
                phoneNumber: '9876543210',
                fullName: `Fake Student ${i} Doe`,
                profileCompleted: true
            });
        }
        const createdStudents = await User.insertMany(studentsToInsert);

        console.log('Seeding Events...');
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 2);

        const events = [
            {
                title: 'Fake Event - Tech Symposium 2026',
                description: 'A grand tech symposium with various events and seminars.',
                date: futureDate,
                time: '10:00 AM',
                endTime: '05:00 PM',
                location: 'Main Auditorium',
                venue: createdVenues[0]._id,
                organizer: 'Computer Science Department',
                category: 'Technical',
                tags: ['tech', 'symposium', 'coding'],
                registrationLimit: 200,
                createdBy: adminUser._id,
                isApproved: true,
                isActive: true
            },
            {
                title: 'Fake Event - Inter-college Sports Meet',
                description: 'Annual sports meet',
                date: pastDate,
                time: '08:00 AM',
                endTime: '06:00 PM',
                location: 'Open Ground',
                venue: createdVenues[2]._id,
                organizer: 'Sports Committee',
                category: 'Sports',
                createdBy: adminUser._id,
                isApproved: true,
                isActive: true
            }
        ];
        const createdEvents = await Event.insertMany(events);

        console.log('Seeding Announcements...');
        const announcements = [
            {
                title: 'Fake Announcement - Welcome to GoCampus!',
                content: 'We are thrilled to launch the new campus event platform.',
                type: 'info',
                isPinned: true,
                createdBy: adminUser._id
            },
            {
                title: 'Fake Announcement - Tech Symposium Deadline',
                content: 'Last date to register for the Tech Symposium 2026 is approaching.',
                type: 'warning',
                relatedEvent: createdEvents[0]._id,
                createdBy: adminUser._id
            }
        ];
        await Announcement.insertMany(announcements);

        console.log('Seeding Attendances...');
        const attendances = [];
        // Only adding attendance for the past event
        for (let i = 0; i < 5; i++) {
            attendances.push({
                event: createdEvents[1]._id,
                student: createdStudents[i]._id,
                status: i % 2 === 0 ? 'Present' : 'Absent',
                session: 'General',
                markedBy: adminUser._id
            });
        }
        await Attendance.insertMany(attendances);

        console.log('Fake Data Added Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
