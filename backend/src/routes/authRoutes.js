const express = require('express');
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', AuthController.sendSignupOTP);
router.post('/signin', AuthController.sendSigninOTP);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/refresh', AuthController.refreshToken);
// router.get('/health', AuthController.healthCheck);

// Protected routes
router.get('/profile', authMiddleware, AuthController.getCurrentUser);
router.post('/signout', authMiddleware, AuthController.signOut);

module.exports = router;
