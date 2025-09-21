const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/otp', AuthController.sendOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/check-user-exists', AuthController.checkUserExists);
router.post('/refresh', AuthController.refreshToken);
router.post('/signout', authMiddleware, AuthController.signOut);

module.exports = router;
