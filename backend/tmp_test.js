const mongoose = require('mongoose');
const dotenv = require('dotenv');

async function testQuery() {
    dotenv.config();
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_event_db');
    } catch (e) {}
    
    try {
        const User = require('./models/User');
        const adminUser = await User.findOne({});
        if (!adminUser) { console.log('No user'); process.exit(0); }

        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1h' });

        const Event = require('./models/Event');
        const event = await Event.findOne();
        if(!event) { console.log('No event'); process.exit(0); }
        
        console.log(`Fetch att for ${event._id}`);
        try {
            const res = await fetch(`http://localhost:5000/api/attendance?event=${event._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if(res.ok) {
                console.log('SUCCESS:', data.length);
            } else {
                console.log('HTTP ERROR:', res.status);
                console.log('JSON:', JSON.stringify(data));
            }
        } catch (err) {
            console.log('FETCH ERR:', err.message);
        }
    } catch (error) {
    } finally {
        process.exit(0);
    }
}
testQuery();
