const db = require('../config/database');

class CardService {
  async getCardById(cardId, userId) {
    try {
      const query = `
        SELECT 
          ac.*,
          q.question_text,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_option,
          q.explanation,
          q.year,
          q.difficulty,
          s.display_name as subject_name,
          st.display_name as subtopic_name
        FROM anki_cards ac
        JOIN questions q ON ac.question_id = q.id
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
        WHERE ac.id = $1 AND ac.user_id = $2
      `;
      
      const result = await db.raw(query, [cardId, userId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting card by ID:', error);
      throw new Error('Failed to get card');
    }
  }

  async getUserCards(userId, filters = {}) {
    try {
      const {
        card_type,
        subject_id,
        subtopic_id,
        is_suspended,
        is_leech,
        limit = 100,
        offset = 0
      } = filters;

      let query = `
        SELECT 
          ac.*,
          q.question_text,
          q.year,
          q.difficulty,
          s.display_name as subject_name,
          st.display_name as subtopic_name
        FROM anki_cards ac
        JOIN questions q ON ac.question_id = q.id
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
        WHERE ac.user_id = $1
      `;

      const params = [userId];
      let paramIndex = 2;

      if (card_type) {
        query += ` AND ac.card_type = $${paramIndex}`;
        params.push(card_type);
        paramIndex++;
      }

      if (subject_id) {
        query += ` AND q.subject_id = $${paramIndex}`;
        params.push(subject_id);
        paramIndex++;
      }

      if (subtopic_id) {
        query += ` AND q.subtopic_id = $${paramIndex}`;
        params.push(subtopic_id);
        paramIndex++;
      }

      if (typeof is_suspended === 'boolean') {
        query += ` AND ac.is_suspended = $${paramIndex}`;
        params.push(is_suspended);
        paramIndex++;
      }

      if (typeof is_leech === 'boolean') {
        query += ` AND ac.is_leech = $${paramIndex}`;
        params.push(is_leech);
        paramIndex++;
      }

      query += ` ORDER BY ac.due_date ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const cards = await db.raw(query, params);
      return cards;
    } catch (error) {
      console.error('Error getting user cards:', error);
      throw new Error('Failed to get user cards');
    }
  }

  async getCardStats(userId, filters = {}) {
    try {
      const { subject_id, subtopic_id } = filters;

      let query = `
        SELECT 
          ac.card_type,
          COUNT(*) as count,
          AVG(ac.ease_factor) as avg_ease_factor,
          AVG(ac.interval_days) as avg_interval,
          AVG(ac.total_reviews) as avg_reviews,
          COUNT(*) FILTER (WHERE ac.is_leech = true) as leech_count,
          COUNT(*) FILTER (WHERE ac.is_suspended = true) as suspended_count
        FROM anki_cards ac
        JOIN questions q ON ac.question_id = q.id
        WHERE ac.user_id = $1
      `;

      const params = [userId];
      let paramIndex = 2;

      if (subject_id) {
        query += ` AND q.subject_id = $${paramIndex}`;
        params.push(subject_id);
        paramIndex++;
      }

      if (subtopic_id) {
        query += ` AND q.subtopic_id = $${paramIndex}`;
        params.push(subtopic_id);
        paramIndex++;
      }

      query += ` GROUP BY ac.card_type ORDER BY ac.card_type`;

      const stats = await db.raw(query, params);
      
      // Calculate totals
      const totals = {
        totalCards: stats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
        totalLeeches: stats.reduce((sum, stat) => sum + parseInt(stat.leech_count), 0),
        totalSuspended: stats.reduce((sum, stat) => sum + parseInt(stat.suspended_count), 0)
      };

      return {
        cardStats: stats,
        totals
      };
    } catch (error) {
      console.error('Error getting card stats:', error);
      throw new Error('Failed to get card stats');
    }
  }

  async suspendCard(cardId, userId, reason = null) {
    try {
      const updatedCards = await db.update('anki_cards', 
        { 
          is_suspended: true,
          updated_at: new Date()
        }, 
        { id: cardId, user_id: userId }
      );

      if (updatedCards.length === 0) {
        throw new Error('Card not found or access denied');
      }

      // Log the suspension
      if (reason) {
        await this.logCardAction(cardId, userId, 'suspend', { reason });
      }

      return updatedCards[0];
    } catch (error) {
      console.error('Error suspending card:', error);
      throw error;
    }
  }

  async unsuspendCard(cardId, userId) {
    try {
      const updatedCards = await db.update('anki_cards', 
        { 
          is_suspended: false,
          updated_at: new Date()
        }, 
        { id: cardId, user_id: userId }
      );

      if (updatedCards.length === 0) {
        throw new Error('Card not found or access denied');
      }

      // Log the unsuspension
      await this.logCardAction(cardId, userId, 'unsuspend');

      return updatedCards[0];
    } catch (error) {
      console.error('Error unsuspending card:', error);
      throw error;
    }
  }

  async buryCard(cardId, userId) {
    try {
      const updatedCards = await db.update('anki_cards', 
        { 
          is_buried: true,
          updated_at: new Date()
        }, 
        { id: cardId, user_id: userId }
      );

      if (updatedCards.length === 0) {
        throw new Error('Card not found or access denied');
      }

      return updatedCards[0];
    } catch (error) {
      console.error('Error burying card:', error);
      throw error;
    }
  }

  async unburyCards(userId, subjectId = null) {
    try {
      let query = `
        UPDATE anki_cards 
        SET is_buried = false, updated_at = NOW()
        WHERE user_id = $1 AND is_buried = true
      `;
      const params = [userId];

      if (subjectId) {
        query += ` AND question_id IN (
          SELECT id FROM questions WHERE subject_id = $2
        )`;
        params.push(subjectId);
      }

      query += ` RETURNING *`;

      const unburiedCards = await db.raw(query, params);
      return unburiedCards;
    } catch (error) {
      console.error('Error unburying cards:', error);
      throw new Error('Failed to unbury cards');
    }
  }

  async resetCard(cardId, userId) {
    try {
      const updatedCards = await db.update('anki_cards', 
        { 
          card_type: 'new',
          ease_factor: 2.50,
          interval_days: 0,
          repetitions: 0,
          lapses: 0,
          learning_step: 0,
          due_date: new Date(),
          is_leech: false,
          is_suspended: false,
          is_buried: false,
          updated_at: new Date()
        }, 
        { id: cardId, user_id: userId }
      );

      if (updatedCards.length === 0) {
        throw new Error('Card not found or access denied');
      }

      // Log the reset
      await this.logCardAction(cardId, userId, 'reset');

      return updatedCards[0];
    } catch (error) {
      console.error('Error resetting card:', error);
      throw error;
    }
  }

  async getCardHistory(cardId, userId, limit = 20) {
    try {
      const query = `
        SELECT 
          rl.*,
          ss.session_start,
          ss.session_mode
        FROM review_log rl
        LEFT JOIN study_sessions ss ON rl.session_id = ss.id
        WHERE rl.card_id = $1 AND rl.user_id = $2
        ORDER BY rl.review_date DESC
        LIMIT $3
      `;

      const history = await db.raw(query, [cardId, userId, limit]);
      return history;
    } catch (error) {
      console.error('Error getting card history:', error);
      throw new Error('Failed to get card history');
    }
  }

  async getLeechCards(userId, limit = 50) {
    try {
      const query = `
        SELECT 
          ac.*,
          q.question_text,
          q.year,
          q.difficulty,
          s.display_name as subject_name,
          st.display_name as subtopic_name
        FROM anki_cards ac
        JOIN questions q ON ac.question_id = q.id
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
        WHERE ac.user_id = $1 AND ac.is_leech = true
        ORDER BY ac.lapses DESC, ac.last_review DESC
        LIMIT $2
      `;

      const leechCards = await db.raw(query, [userId, limit]);
      return leechCards;
    } catch (error) {
      console.error('Error getting leech cards:', error);
      throw new Error('Failed to get leech cards');
    }
  }

  async logCardAction(cardId, userId, action, metadata = {}) {
    try {
      // This could be expanded to log card actions in a separate table
      // For now, we'll just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`Card action: ${action}`, {
          cardId,
          userId,
          action,
          metadata,
          timestamp: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error logging card action:', error);
      // Don't throw error for logging failures
      return false;
    }
  }

  async getOverdueCards(userId, limit = 100) {
    try {
      const query = `
        SELECT 
          ac.*,
          q.question_text,
          q.year,
          q.difficulty,
          s.display_name as subject_name,
          st.display_name as subtopic_name,
          EXTRACT(DAYS FROM (CURRENT_DATE - DATE(ac.due_date))) as days_overdue
        FROM anki_cards ac
        JOIN questions q ON ac.question_id = q.id
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
        WHERE ac.user_id = $1 
          AND ac.card_type = 'review'
          AND DATE(ac.due_date) < CURRENT_DATE
          AND NOT ac.is_suspended
          AND NOT ac.is_buried
        ORDER BY ac.due_date ASC
        LIMIT $2
      `;

      const overdueCards = await db.raw(query, [userId, limit]);
      return overdueCards;
    } catch (error) {
      console.error('Error getting overdue cards:', error);
      throw new Error('Failed to get overdue cards');
    }
  }
}

module.exports = new CardService();