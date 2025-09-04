const express = require('express');
const authRoutes = require('./auth.routes');
const cardsRoutes = require('./cards.routes');
const questionsRoutes = require('./questions.routes');
const sessionsRoutes = require('./sessions.routes');
const progressRoutes = require('./progress.routes');
const settingsRoutes = require('./settings.routes');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/cards', cardsRoutes);
router.use('/questions', questionsRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/progress', progressRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;