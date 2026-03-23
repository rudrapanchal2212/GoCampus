const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy');

// @desc    Register new user (First user = Admin, rest = Student)
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Check if this is the first user (make them admin)
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        department,
        role: isFirstUser ? 'admin' : 'student'
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileCompleted: user.profileCompleted,
            token: generateToken(user._id, user.role)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileCompleted: user.profileCompleted,
            enrollmentNo: user.enrollmentNo,
            phoneNumber: user.phoneNumber,
            aadhaarCard: user.aadhaarCard,
            fullName: user.fullName,
            profilePhoto: user.profilePhoto,
            token: generateToken(user._id, user.role)
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Authenticate with Google
// @route   POST /api/users/google-login
// @access  Public
const googleLoginUser = asyncHandler(async (req, res) => {
    const { credential } = req.body;
    let payload;

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID || 'dummy',
        });
        payload = ticket.getPayload();
    } catch (error) {
        // Fallback for missing/invalid Google Client ID (decode instead of verify)
        // Useful for development when user lacks GCP credentials
        payload = jwt.decode(credential);
        if (!payload || !payload.email) {
            res.status(400);
            throw new Error('Invalid Google credential');
        }
    }

    const { email, name, sub, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
        // Create new user for google login
        const userCount = await User.countDocuments();
        const isFirstUser = userCount === 0;

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash(sub + Date.now().toString(), salt);

        user = await User.create({
            name,
            email,
            password,
            profilePhoto: picture,
            role: isFirstUser ? 'admin' : 'student'
        });
    }

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        enrollmentNo: user.enrollmentNo,
        phoneNumber: user.phoneNumber,
        aadhaarCard: user.aadhaarCard,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto || picture,
        token: generateToken(user._id, user.role)
    });
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Update user profile (Student)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { email, enrollmentNo, phoneNumber, aadhaarCard, fullName, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Update profile fields
    if (email) {
        // Check if email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
            res.status(400);
            throw new Error('Email already in use');
        }
        user.email = email;
    }
    if (enrollmentNo) user.enrollmentNo = enrollmentNo;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (aadhaarCard) user.aadhaarCard = aadhaarCard;
    if (fullName) user.fullName = fullName;
    if (profilePhoto) user.profilePhoto = profilePhoto;

    // Check if profile is complete
    if (enrollmentNo && phoneNumber && aadhaarCard && fullName && profilePhoto) {
        user.profileCompleted = true;
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        enrollmentNo: updatedUser.enrollmentNo,
        phoneNumber: updatedUser.phoneNumber,
        aadhaarCard: updatedUser.aadhaarCard,
        fullName: updatedUser.fullName,
        profilePhoto: updatedUser.profilePhoto,
        profileCompleted: updatedUser.profileCompleted,
        token: generateToken(updatedUser._id, updatedUser.role)
    });
});

// @desc    Get all students
// @route   GET /api/users/students
// @desc    Get all students and coordinators
// @route   GET /api/users/students
// @access  Private (Admin)
const getAllStudents = asyncHandler(async (req, res) => {
    const students = await User.find({ role: { $in: ['student', 'coordinator'] } }).select('-password');
    res.json(students);
});

// @desc    Change user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
const changeUserRole = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only administrators can change roles');
    }

    const { role } = req.body;
    
    if (!['student', 'coordinator'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    const user = await User.findById(req.params.id);

    if (user) {
        user.role = role;
        await user.save();
        res.json({ message: 'User role updated', user: { _id: user._id, name: user.name, role: user.role } });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    googleLoginUser,
    getMe,
    updateProfile,
    getAllStudents,
    changeUserRole
};
