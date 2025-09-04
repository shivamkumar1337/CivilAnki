const express = require('express');
const sessionsController = require('../controllers/sessions.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

const router = express.Router();

router.use(authMiddleware); // All session routes require authentication

router.post('/start', validate(schemas.startSession), sessionsController.startSession);
router.put('/:sessionId/end', sessionsController.endSession);
router.get('/history', sessionsController.getSessionHistory);
router.get('/:sessionId/summary', sessionsController.getSessionSummary);

module.exports = router;