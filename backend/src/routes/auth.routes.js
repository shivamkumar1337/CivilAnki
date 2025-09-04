const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

const router = express.Router();

router.use(authMiddleware); // All auth routes require authentication

router.get('/profile', authController.getProfile);
router.put('/profile', validate(schemas.updateProfile), authController.updateProfile);
router.delete('/account', authController.deleteAccount);

module.exports = router;