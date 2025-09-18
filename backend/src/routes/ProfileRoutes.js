const express = require('express');
const ProfileController = require('../controllers/ProfileController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Health check
// router.get('/health', ProfileController.healthCheck);

// User profile routes (protected)
router.get('/getprofile', authMiddleware, ProfileController.getProfile);
router.post('/updateprofile',authMiddleware, ProfileController.updateProfile);
router.put('/createprofile', authMiddleware, ProfileController.createProfile);

module.exports = router;
