const express = require('express');
const settingsController = require('../controllers/settings.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

const router = express.Router();

router.use(authMiddleware); // All settings routes require authentication

router.get('/anki', settingsController.getAnkiSettings);
router.put('/anki', validate(schemas.updateSettings), settingsController.updateAnkiSettings);
router.get('/preferences', settingsController.getUserPreferences);
router.put('/preferences', validate(schemas.updateProfile), settingsController.updateUserPreferences);
router.put('/mobile', settingsController.updateMobileNumber);

module.exports = router;