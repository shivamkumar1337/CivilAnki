const sessionService = require('../services/session.service');
const progressService = require('../services/progress.service');

class SessionsController {
  async startSession(req, res, next) {
    try {
      const userId = req.userId;
      const sessionData = {
        selectedSubjects: req.body.subjects || [],
        selectedSubtopics: req.body.subtopics || [],
        selectedYearRanges: req.body.year_ranges || [],
        mode: req.body.mode || 'mixed',
        targetCards: req.body.target_cards
      };

      const session = await sessionService.createSession(userId, sessionData);

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          configuration: {
            subjects: sessionData.selectedSubjects,
            subtopics: sessionData.selectedSubtopics,
            yearRanges: sessionData.selectedYearRanges,
            mode: sessionData.mode,
            targetCards: sessionData.targetCards
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async endSession(req, res, next) {
    try {
      const userId = req.userId;
      const { sessionId } = req.params;
      const sessionStats = req.body;

      // Verify session belongs to user
      const session = await sessionService.getSessionById(sessionId, userId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      const updatedSession = await sessionService.endSession(sessionId, sessionStats);
      
      // Update user streak
      await progressService.updateStreak(userId);

      res.json({
        success: true,
        data: updatedSession
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionHistory(req, res, next) {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit) || 20;

      const sessions = await sessionService.getSessionHistory(userId, limit);

      res.json({
        success: true,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }

  async getSessionSummary(req, res, next) {
    try {
      const userId = req.userId;
      const { sessionId } = req.params;

      const session = await sessionService.getSessionById(sessionId, userId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      // Get detailed session data with review logs
      const db = require('../config/database');
      const reviewsQuery = `
        SELECT 
          rl.*,
          q.question_text,
          q.correct_option,
          s.display_name as subject_name,
          st.display_name as subtopic_name
        FROM review_log rl
        JOIN anki_cards ac ON rl.card_id = ac.id
        JOIN questions q ON ac.question_id = q.id
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
        WHERE rl.session_id = $1 AND rl.user_id = $2
        ORDER BY rl.created_at
      `;

      const reviews = await db.raw(reviewsQuery, [sessionId, userId]);

      res.json({
        success: true,
        data: {
          session,
          reviews,
          summary: {
            totalQuestions: reviews.length,
            correctAnswers: reviews.filter(r => r.is_correct).length,
            accuracy: reviews.length > 0 ? 
              Math.round((reviews.filter(r => r.is_correct).length / reviews.length) * 100) : 0,
            averageTime: reviews.length > 0 ?
              reviews.reduce((sum, r) => sum + (r.response_time_seconds || 0), 0) / reviews.length : 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SessionsController();