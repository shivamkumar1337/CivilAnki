const db = require('../config/database');

class SessionService {
  async createSession(userId, sessionData) {
    try {
      const session = await db.insert('study_sessions', {
        user_id: userId,
        selected_subjects: sessionData.selectedSubjects || [],
        selected_subtopics: sessionData.selectedSubtopics || [],
        selected_year_ranges: sessionData.selectedYearRanges || [],
        session_mode: sessionData.mode || 'mixed',
        target_cards: sessionData.targetCards || null,
        session_start: new Date()
      });

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  async updateSession(sessionId, updates) {
    try {
      const session = await db.update('study_sessions', updates, { id: sessionId });
      return session[0];
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session');
    }
  }

  async endSession(sessionId, sessionStats) {
    try {
      const updates = {
        session_end: new Date(),
        total_cards_studied: sessionStats.totalCards || 0,
        correct_answers: sessionStats.correctAnswers || 0,
        incorrect_answers: sessionStats.incorrectAnswers || 0,
        accuracy_percentage: sessionStats.accuracy || 0,
        total_study_time_seconds: sessionStats.totalTime || 0,
        average_answer_time_seconds: sessionStats.averageTime || 0,
        completed: true
      };

      const session = await db.update('study_sessions', updates, { id: sessionId });
      return session[0];
    } catch (error) {
      console.error('Error ending session:', error);
      throw new Error('Failed to end session');
    }
  }

  async getSessionHistory(userId, limit = 20) {
    try {
      const sessions = await db.select('study_sessions', {
        where: { user_id: userId, completed: true },
        order: { column: 'session_start', ascending: false },
        limit
      });

      return sessions;
    } catch (error) {
      console.error('Error getting session history:', error);
      throw new Error('Failed to get session history');
    }
  }

  async getSessionById(sessionId, userId) {
    try {
      const sessions = await db.select('study_sessions', {
        where: { id: sessionId, user_id: userId }
      });

      return sessions[0];
    } catch (error) {
      console.error('Error getting session:', error);
      throw new Error('Failed to get session');
    }
  }
}

module.exports = new SessionService();