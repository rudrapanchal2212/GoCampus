const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Venue = require('./models/Venue');
const Event = require('./models/Event');
const Attendance = require('./models/Attendance');
const Announcement = require('./models/Announcement');

dotenv.config();
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus_event_db');


const importData = async () => {
    try {
        console.log('Reading large-scale-campus-data.json file...');
        const data = JSON.parse(fs.readFileSync('large-scale-campus-data.json', 'utf-8'));
        
        console.log('Clearing existing data from database...');
        await User.deleteMany();
        await Venue.deleteMany();
        await Event.deleteMany();
        await Attendance.deleteMany();
        await Announcement.deleteMany();
        
        console.log('Importing 500+ Users...');
        await User.insertMany(data.users);
        
        console.log('Importing Venues...');
        await Venue.insertMany(data.venues);
        
        console.log('Importing 50 Events...');
        await Event.insertMany(data.events);
        
        console.log('Importing Attendances...');
        await Attendance.insertMany(data.attendances);
        
        console.log('Importing Announcements...');
        await Announcement.insertMany(data.announcements);
        
        console.log('Data Imported Successfully! Check your website now.');
        process.exit();
    } catch (err) {
        console.error('Error importing data:', err);
        process.exit(1);
    }
};

importData();
