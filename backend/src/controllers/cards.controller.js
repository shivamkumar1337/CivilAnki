const ankiService = require('../services/anki.service');
const { validate, schemas } = require('../middleware/validation.middleware');

class CardsController {
  async getDueCards(req, res, next) {
    try {
      const userId = req.userId;
      const options = {
        newCardsLimit: parseInt(req.query.new_cards_limit) || 20,
        reviewCardsLimit: parseInt(req.query.review_cards_limit) || 100,
        learningCardsLimit: parseInt(req.query.learning_cards_limit) || 100,
        subjectFilter: req.query.subjects ? req.query.subjects.split(',') : null,
        subtopicFilter: req.query.subtopics ? req.query.subtopics.split(',') : null,
        yearFilter: req.query.years ? req.query.years.split(',').map(Number) : null
      };

      const result = await ankiService.getDueCards(userId, options);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async answerCard(req, res, next) {
    try {
      const userId = req.userId;
      const {
        card_id,
        grade,
        response_time_seconds,
        selected_option,
        session_id
      } = req.body;

      const result = await ankiService.processAnswer(
        userId,
        card_id,
        grade,
        response_time_seconds,
        selected_option,
        session_id
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getCardStats(req, res, next) {
    try {
      const userId = req.userId;
      
      // Get card statistics
      const query = `
        SELECT 
          card_type,
          COUNT(*) as count,
          AVG(ease_factor) as avg_ease_factor,
          AVG(interval_days) as avg_interval
        FROM anki_cards 
        WHERE user_id = $1 AND NOT is_suspended
        GROUP BY card_type
      `;
      
      const db = require('../config/database');
      const stats = await db.raw(query, [userId]);
      
      res.json({
        success: true,
        data: {
          cardStats: stats,
          totalCards: stats.reduce((sum, stat) => sum + parseInt(stat.count), 0)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async suspendCard(req, res, next) {
    try {
      const userId = req.userId;
      const { cardId } = req.params;

      const db = require('../config/database');
      await db.update('anki_cards', 
        { is_suspended: true }, 
        { id: cardId, user_id: userId }
      );

      res.json({
        success: true,
        message: 'Card suspended successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async unsuspendCard(req, res, next) {
    try {
      const userId = req.userId;
      const { cardId } = req.params;

      const db = require('../config/database');
      await db.update('anki_cards', 
        { is_suspended: false }, 
        { id: cardId, user_id: userId }
      );

      res.json({
        success: true,
        message: 'Card unsuspended successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CardsController();