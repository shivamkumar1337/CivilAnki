const express = require('express');
const ProfileController = require('../controllers/ProfileController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Health check
// router.get('/health', ProfileController.healthCheck);

// User profile routes (protected)
router.get('/getprofile', authMiddleware, ProfileController.getProfile);
router.put('/updateprofile', authMiddleware, ProfileController.updateProfile);
router.put('/streak', authMiddleware, ProfileController.updateStreak);

module.exports = router;
