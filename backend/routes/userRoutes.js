const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLoginUser, getMe, updateProfile, getAllStudents } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLoginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/students', protect, getAllStudents);

module.exports = router;
