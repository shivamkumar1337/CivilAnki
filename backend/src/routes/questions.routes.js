const express = require('express');
const questionsController = require('../controllers/questions.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware); // All question routes require authentication

router.get('/subjects', questionsController.getSubjects);
router.get('/subjects/:subjectId/subtopics', questionsController.getSubtopics);
router.get('/search', questionsController.searchQuestions);
router.get('/', questionsController.getQuestions);
router.get('/:questionId', questionsController.getQuestionById);

module.exports = router;