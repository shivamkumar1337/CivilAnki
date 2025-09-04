const express = require('express');
const cardsController = require('../controllers/cards.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

const router = express.Router();

router.use(authMiddleware); // All card routes require authentication

router.get('/due', cardsController.getDueCards);
router.post('/answer', validate(schemas.answerCard), cardsController.answerCard);
router.get('/stats', cardsController.getCardStats);
router.put('/:cardId/suspend', cardsController.suspendCard);
router.put('/:cardId/unsuspend', cardsController.unsuspendCard);

module.exports = router;