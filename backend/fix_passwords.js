const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/campus_event_db');

const fixPasswordsAndAdmin = async () => {
    try {
        console.log('Generating valid password hash for "password123"...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        console.log('Updating all users with valid password...');
        await User.updateMany({}, { password: hashedPassword });
        
        // Let's create an explicit admin account for the user that just works, 
        // using the name they had on their screen so it feels seamless
        const exactAdminEmail = 'rudra@gocampus.edu';
        await User.deleteOne({ email: exactAdminEmail }); // ensure clean state for this insert
        
        await User.create({
            name: 'Panchal Rudra Navinkumar',
            email: exactAdminEmail,
            password: hashedPassword,
            department: 'Computer Science',
            role: 'admin',
            profileCompleted: true
        });

        console.log(`\n================================`);
        console.log(`✅ DATABASE FIXED SUCCESSFULLY!`);
        console.log(`================================`);
        console.log(`Since your old account was wiped during the mock data generation, your current browser session is invalid.`);
        console.log(`Please follow these instructions:`);
        console.log(`1. Click the "Logout" button on your frontend.`);
        console.log(`2. Login with the following Admin account:`);
        console.log(`   Email: ${exactAdminEmail}`);
        console.log(`   Password: password123`);
        console.log(`================================\n`);
        
        process.exit();
    } catch (err) {
        console.error('Error fixing db:', err);
        process.exit(1);
    }
};

fixPasswordsAndAdmin();
