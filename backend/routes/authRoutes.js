const express = require('express');
const router = express.Router();
const { requestEmailOtp, verifyEmailOtp, registerUser, loginUser, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/email/request-otp', requestEmailOtp);
router.post('/email/verify-otp', verifyEmailOtp);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;