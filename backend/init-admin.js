const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        console.log('Connecting to Atlas...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'admin@gocampus.com';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const existing = await User.findOne({ email });

        if (existing) {
            console.log('Admin already exists. Updating password to "admin123" (hashed)...');
            existing.password = hashedPassword;
            existing.role = 'admin';
            await existing.save();
        } else {
            console.log('Creating new admin: admin@gocampus.com / admin123 (hashed)');
            const admin = new User({
                name: 'System Admin',
                email: email,
                password: hashedPassword,
                role: 'admin',
                department: 'Administration'
            });
            await admin.save();
        }

        console.log('✅ Admin account is ready on Atlas cluster.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

createAdmin();
