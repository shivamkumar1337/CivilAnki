const express = require('express');
const progressController = require('../controllers/progress.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware); // All progress routes require authentication

router.get('/overview', progressController.getOverview);
router.get('/subjects', progressController.getSubjects);
router.get('/streaks', progressController.getStreaks);
router.get('/analytics', progressController.getAnalytics);

module.exports = router;