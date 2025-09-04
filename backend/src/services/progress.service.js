const db = require('../config/database');

class ProgressService {
  async getSubjectProgress(userId, subjectId = null) {
    try {
      let query = `
        SELECT 
          s.id as subject_id,
          s.display_name as subject_name,
          st.id as subtopic_id,
          st.display_name as subtopic_name,
          st.total_questions,
          COUNT(ac.id) FILTER (WHERE ac.card_type = 'review' AND ac.interval_days > 21) as mastered_count,
          COUNT(ac.id) FILTER (WHERE ac.card_type IN ('learning', 'relearning')) as learning_count,
          COUNT(ac.id) FILTER (WHERE ac.card_type = 'new') as new_count,
          COUNT(ac.id) FILTER (WHERE DATE(ac.due_date) <= CURRENT_DATE AND NOT ac.is_suspended) as pending_today,
          CASE 
            WHEN st.total_questions > 0 THEN
              ROUND(COUNT(ac.id) FILTER (WHERE ac.card_type = 'review' AND ac.interval_days > 21) * 100.0 / st.total_questions, 2)
            ELSE 0
          END as progress_percentage,
          CASE 
            WHEN COUNT(rl.id) > 0 THEN
              ROUND(COUNT(rl.id) FILTER (WHERE rl.is_correct = true) * 100.0 / COUNT(rl.id), 2)
            ELSE 0
          END as accuracy_percentage,
          MAX(rl.review_date) as last_studied
        FROM subjects s
        JOIN subtopics st ON s.id = st.subject_id
        LEFT JOIN questions q ON st.id = q.subtopic_id AND q.status = 'active'
        LEFT JOIN anki_cards ac ON q.id = ac.question_id AND ac.user_id = $1
        LEFT JOIN review_log rl ON ac.id = rl.card_id
        WHERE s.is_active = true AND st.is_active = true
      `;
      
      const params = [userId];
      
      if (subjectId) {
        query += ` AND s.id = $2`;
        params.push(subjectId);
      }
      
      query += `
        GROUP BY s.id, s.display_name, st.id, st.display_name, st.total_questions
        ORDER BY s.display_order, st.display_order
      `;
      
      return await db.raw(query, params);
    } catch (error) {
      console.error('Error getting subject progress:', error);
      throw new Error('Failed to get subject progress');
    }
  }

  async getOverallProgress(userId) {
    try {
      const query = `
        SELECT 
          up.study_streak,
          up.longest_streak,
          up.total_questions_answered,
          up.total_correct_answers,
          up.overall_accuracy,
          up.last_study_date,
          COUNT(DISTINCT ac.id) FILTER (WHERE ac.card_type = 'review' AND ac.interval_days > 21) as total_mastered,
          COUNT(DISTINCT ac.id) FILTER (WHERE ac.card_type IN ('learning', 'relearning')) as total_learning,
          COUNT(DISTINCT ac.id) FILTER (WHERE ac.card_type = 'new') as total_new,
          COUNT(DISTINCT ac.id) FILTER (WHERE DATE(ac.due_date) <= CURRENT_DATE AND NOT ac.is_suspended) as total_due_today,
          COUNT(DISTINCT ss.id) FILTER (WHERE ss.session_start >= CURRENT_DATE - INTERVAL '7 days' AND ss.completed = true) as sessions_this_week,
          AVG(rl.response_time_seconds) FILTER (WHERE rl.review_date >= CURRENT_DATE - INTERVAL '7 days') as avg_response_time_week,
          ROUND(
            COUNT(rl.id) FILTER (WHERE rl.is_correct = true AND rl.review_date >= CURRENT_DATE - INTERVAL '7 days') * 100.0 / 
            NULLIF(COUNT(rl.id) FILTER (WHERE rl.review_date >= CURRENT_DATE - INTERVAL '7 days'), 0), 2
          ) as accuracy_this_week
        FROM user_profiles up
        LEFT JOIN anki_cards ac ON up.id = ac.user_id
        LEFT JOIN study_sessions ss ON up.id = ss.user_id
        LEFT JOIN review_log rl ON up.id = rl.user_id
        WHERE up.id = $1
        GROUP BY up.id, up.study_streak, up.longest_streak, up.total_questions_answered, 
                 up.total_correct_answers, up.overall_accuracy, up.last_study_date
      `;
      
      const result = await db.raw(query, [userId]);
      return result[0];
    } catch (error) {
      console.error('Error getting overall progress:', error);
      throw new Error('Failed to get overall progress');
    }
  }

  async updateStreak(userId) {
    try {
      // Calculate current streak
      const streakQuery = `
        WITH daily_sessions AS (
          SELECT DISTINCT DATE(session_start) as session_date
          FROM study_sessions 
          WHERE user_id = $1 
            AND completed = true 
            AND total_cards_studied > 0
          ORDER BY session_date DESC
        ),
        streak_calculation AS (
          SELECT 
            session_date,
            ROW_NUMBER() OVER (ORDER BY session_date DESC) as row_num,
            session_date + INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY session_date DESC) as expected_date
          FROM daily_sessions
        )
        SELECT COUNT(*) as current_streak
        FROM streak_calculation
        WHERE expected_date = CURRENT_DATE + INTERVAL '1 day' * row_num
          AND session_date >= CURRENT_DATE - INTERVAL '365 days'
      `;
      
      const streakResult = await db.raw(streakQuery, [userId]);
      const currentStreak = streakResult[0]?.current_streak || 0;
      
      // Update user profile
      await db.update('user_profiles', {
        study_streak: currentStreak,
        longest_streak: db.raw(`GREATEST(longest_streak, ${currentStreak})`),
        last_study_date: new Date().toISOString().split('T')[0]
      }, { id: userId });
      
      return currentStreak;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw new Error('Failed to update streak');
    }
  }

  async getAnalytics(userId, period = '30') {
    try {
      const query = `
        SELECT 
          DATE(rl.review_date) as date,
          COUNT(*) as total_reviews,
          COUNT(*) FILTER (WHERE rl.is_correct = true) as correct_reviews,
          ROUND(COUNT(*) FILTER (WHERE rl.is_correct = true) * 100.0 / COUNT(*), 2) as daily_accuracy,
          AVG(rl.response_time_seconds) as avg_response_time,
          COUNT(DISTINCT rl.card_id) as unique_cards_reviewed
        FROM review_log rl
        WHERE rl.user_id = $1 
          AND rl.review_date >= CURRENT_DATE - INTERVAL '${period} days'
        GROUP BY DATE(rl.review_date)
        ORDER BY date DESC
      `;
      
      return await db.raw(query, [userId]);
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw new Error('Failed to get analytics');
    }
  }
}

module.exports = new ProgressService();