const db = require('../config/database');
const ankiService = require('./anki.service');

class QuestionService {
  async getAllSubjects() {
    try {
      const subjects = await db.select('subjects', {
        where: { is_active: true },
        order: { column: 'display_order', ascending: true }
      });
      
      return subjects;
    } catch (error) {
      console.error('Error getting subjects:', error);
      throw new Error('Failed to get subjects');
    }
  }

  async getSubjectById(subjectId) {
    try {
      const subjects = await db.select('subjects', {
        where: { id: subjectId, is_active: true }
      });
      
      return subjects[0] || null;
    } catch (error) {
      console.error('Error getting subject by ID:', error);
      throw new Error('Failed to get subject');
    }
  }

  async getSubtopicsBySubject(subjectId) {
    try {
      const subtopics = await db.select('subtopics', {
        where: { subject_id: subjectId, is_active: true },
        order: { column: 'display_order', ascending: true }
      });
      
      return subtopics;
    } catch (error) {
      console.error('Error getting subtopics:', error);
      throw new Error('Failed to get subtopics');
    }
  }

  async getSubtopicById(subtopicId) {
    try {
      const subtopics = await db.select('subtopics', {
        where: { id: subtopicId, is_active: true }
      });
      
      return subtopics[0] || null;
    } catch (error) {
      console.error('Error getting subtopic by ID:', error);
      throw new Error('Failed to get subtopic');
    }
  }

  async getQuestions(filters = {}, userId = null) {
    try {
      const {
        subject_id,
        subtopic_id,
        year,
        difficulty,
        limit = 50,
        offset = 0,
        sort_by = 'year',
        sort_order = 'desc'
      } = filters;

      let query = `
        SELECT 
          q.*,
          s.display_name as subject_name,
          st.display_name as subtopic_name
      `;
      
      if (userId) {
        query += `,
          ac.id as card_id,
          ac.card_type,
          ac.due_date,
          ac.interval_days,
          ac.total_reviews,
          ac.times_correct
        `;
      }
      
      query += `
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
      `;
      
      if (userId) {
        query += `
          LEFT JOIN anki_cards ac ON q.id = ac.question_id AND ac.user_id = $1
        `;
      }
      
      query += ` WHERE q.status = 'active'`;
      
      const params = userId ? [userId] : [];
      let paramIndex = params.length + 1;

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

      if (year) {
        query += ` AND q.year = $${paramIndex}`;
        params.push(year);
        paramIndex++;
      }

      if (difficulty) {
        query += ` AND q.difficulty = $${paramIndex}`;
        params.push(difficulty);
        paramIndex++;
      }

      // Add sorting
      const validSortColumns = ['year', 'difficulty', 'created_at', 'question_number'];
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'year';
      const sortDirection = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      
      query += ` ORDER BY q.${sortColumn} ${sortDirection}`;
      
      // Add pagination
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const questions = await db.raw(query, params);
      
      return questions;
    } catch (error) {
      console.error('Error getting questions:', error);
      throw new Error('Failed to get questions');
    }
  }

  async getQuestionById(questionId, userId = null) {
    try {
      let query = `
        SELECT 
          q.*,
          s.display_name as subject_name,
          st.display_name as subtopic_name
      `;
      
      if (userId) {
        query += `,
          ac.id as card_id,
          ac.card_type,
          ac.due_date,
          ac.interval_days,
          ac.total_reviews,
          ac.times_correct,
          ac.ease_factor,
          ac.repetitions,
          ac.lapses
        `;
      }
      
      query += `
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
      `;
      
      if (userId) {
        query += `
          LEFT JOIN anki_cards ac ON q.id = ac.question_id AND ac.user_id = $1
        `;
      }
      
      query += ` WHERE q.id = $${userId ? 2 : 1} AND q.status = 'active'`;
      
      const params = userId ? [userId, questionId] : [questionId];
      const result = await db.raw(query, params);
      const question = result[0];

      if (!question) {
        return null;
      }

      // Initialize card if user is provided and card doesn't exist
      if (userId && !question.card_id) {
        const card = await ankiService.initializeCardForUser(userId, questionId);
        question.card_id = card.id;
        question.card_type = card.card_type;
        question.due_date = card.due_date;
        question.interval_days = card.interval_days;
        question.total_reviews = card.total_reviews;
        question.times_correct = card.times_correct;
        question.ease_factor = card.ease_factor;
        question.repetitions = card.repetitions;
        question.lapses = card.lapses;
      }
      
      return question;
    } catch (error) {
      console.error('Error getting question by ID:', error);
      throw new Error('Failed to get question');
    }
  }

  async searchQuestions(searchQuery, filters = {}) {
    try {
      const { 
        subject_id, 
        year_from, 
        year_to, 
        limit = 20 
      } = filters;

      if (!searchQuery || searchQuery.trim().length < 3) {
        throw new Error('Search query must be at least 3 characters long');
      }

      let query = `
        SELECT 
          q.id,
          q.question_text,
          q.year,
          q.difficulty,
          s.display_name as subject_name,
          st.display_name as subtopic_name,
          ts_rank(to_tsvector('english', q.question_text), plainto_tsquery('english', $1)) as rank
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
        WHERE q.status = 'active'
          AND to_tsvector('english', q.question_text) @@ plainto_tsquery('english', $1)
      `;

      const params = [searchQuery.trim()];
      let paramIndex = 2;

      if (subject_id) {
        query += ` AND q.subject_id = $${paramIndex}`;
        params.push(subject_id);
        paramIndex++;
      }

      if (year_from) {
        query += ` AND q.year >= $${paramIndex}`;
        params.push(year_from);
        paramIndex++;
      }

      if (year_to) {
        query += ` AND q.year <= $${paramIndex}`;
        params.push(year_to);
        paramIndex++;
      }

      query += ` ORDER BY rank DESC, q.year DESC LIMIT $${paramIndex}`;
      params.push(limit);

      const results = await db.raw(query, params);
      
      return results;
    } catch (error) {
      console.error('Error searching questions:', error);
      throw error;
    }
  }

  async getQuestionStats(questionId) {
    try {
      const query = `
        SELECT 
          q.total_attempts,
          q.correct_attempts,
          q.accuracy_rate,
          q.actual_average_time_seconds,
          COUNT(ac.id) as total_cards,
          COUNT(ac.id) FILTER (WHERE ac.card_type = 'review' AND ac.interval_days > 21) as mastered_count,
          AVG(ac.ease_factor) as average_ease_factor,
          AVG(ac.interval_days) FILTER (WHERE ac.card_type = 'review') as average_interval
        FROM questions q
        LEFT JOIN anki_cards ac ON q.id = ac.question_id
        WHERE q.id = $1
        GROUP BY q.id, q.total_attempts, q.correct_attempts, q.accuracy_rate, q.actual_average_time_seconds
      `;
      
      const result = await db.raw(query, [questionId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting question stats:', error);
      throw new Error('Failed to get question stats');
    }
  }

  async getRandomQuestions(filters = {}, count = 10) {
    try {
      const {
        subject_id,
        subtopic_id,
        difficulty,
        year_from,
        year_to
      } = filters;

           let query = `
        SELECT 
          q.*,
          s.display_name as subject_name,
          st.display_name as subtopic_name
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
        WHERE q.status = 'active'
      `;

      const params = [];
      let paramIndex = 1;

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

      if (difficulty) {
        query += ` AND q.difficulty = $${paramIndex}`;
        params.push(difficulty);
        paramIndex++;
      }

      if (year_from) {
        query += ` AND q.year >= $${paramIndex}`;
        params.push(year_from);
        paramIndex++;
      }

      if (year_to) {
        query += ` AND q.year <= $${paramIndex}`;
        params.push(year_to);
        paramIndex++;
      }

      query += ` ORDER BY RANDOM() LIMIT $${paramIndex}`;
      params.push(count);

      const questions = await db.raw(query, params);
      return questions;
    } catch (error) {
      console.error('Error getting random questions:', error);
      throw new Error('Failed to get random questions');
    }
  }

  async getYearRanges(subjectId = null) {
    try {
      let query = `
        SELECT 
          MIN(year) as min_year,
          MAX(year) as max_year,
          COUNT(*) as total_questions,
          array_agg(DISTINCT year ORDER BY year) as available_years
        FROM questions q
        WHERE q.status = 'active'
      `;

      const params = [];
      if (subjectId) {
        query += ` AND q.subject_id = $1`;
        params.push(subjectId);
      }

      const result = await db.raw(query, params);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting year ranges:', error);
      throw new Error('Failed to get year ranges');
    }
  }

  async getQuestionsByYear(year, filters = {}) {
    try {
      const { subject_id, subtopic_id, limit = 100 } = filters;

      let query = `
        SELECT 
          q.*,
          s.display_name as subject_name,
          st.display_name as subtopic_name
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
        WHERE q.status = 'active' AND q.year = $1
      `;

      const params = [year];
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

      query += ` ORDER BY q.question_number LIMIT $${paramIndex}`;
      params.push(limit);

      const questions = await db.raw(query, params);
      return questions;
    } catch (error) {
      console.error('Error getting questions by year:', error);
      throw new Error('Failed to get questions by year');
    }
  }

  async updateQuestionStats(questionId, isCorrect, responseTime) {
    try {
      const query = `
        UPDATE questions SET
          total_attempts = total_attempts + 1,
          correct_attempts = correct_attempts + $2,
          accuracy_rate = ROUND((correct_attempts + $2) * 100.0 / (total_attempts + 1), 2),
          actual_average_time_seconds = CASE 
            WHEN $3 IS NOT NULL THEN
              CASE 
                WHEN total_attempts = 0 THEN $3
                ELSE (COALESCE(actual_average_time_seconds, 0) * total_attempts + $3) / (total_attempts + 1)
              END
            ELSE actual_average_time_seconds
          END,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.raw(query, [questionId, isCorrect ? 1 : 0, responseTime]);
      return result[0];
    } catch (error) {
      console.error('Error updating question stats:', error);
      throw new Error('Failed to update question stats');
    }
  }

  async getSubjectStats(subjectId) {
    try {
      const query = `
        SELECT 
          s.*,
          COUNT(q.id) as total_questions,
          COUNT(q.id) FILTER (WHERE q.difficulty = 'easy') as easy_questions,
          COUNT(q.id) FILTER (WHERE q.difficulty = 'medium') as medium_questions,
          COUNT(q.id) FILTER (WHERE q.difficulty = 'hard') as hard_questions,
          MIN(q.year) as earliest_year,
          MAX(q.year) as latest_year,
          AVG(q.accuracy_rate) as average_accuracy,
          AVG(q.actual_average_time_seconds) as average_time
        FROM subjects s
        LEFT JOIN questions q ON s.id = q.subject_id AND q.status = 'active'
        WHERE s.id = $1 AND s.is_active = true
        GROUP BY s.id
      `;
      
      const result = await db.raw(query, [subjectId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting subject stats:', error);
      throw new Error('Failed to get subject stats');
    }
  }

  async getSubtopicStats(subtopicId) {
    try {
      const query = `
        SELECT 
          st.*,
          s.display_name as subject_name,
          COUNT(q.id) as total_questions,
          COUNT(q.id) FILTER (WHERE q.difficulty = 'easy') as easy_questions,
          COUNT(q.id) FILTER (WHERE q.difficulty = 'medium') as medium_questions,
          COUNT(q.id) FILTER (WHERE q.difficulty = 'hard') as hard_questions,
          MIN(q.year) as earliest_year,
          MAX(q.year) as latest_year,
          AVG(q.accuracy_rate) as average_accuracy,
          AVG(q.actual_average_time_seconds) as average_time
        FROM subtopics st
        JOIN subjects s ON st.subject_id = s.id
        LEFT JOIN questions q ON st.id = q.subtopic_id AND q.status = 'active'
        WHERE st.id = $1 AND st.is_active = true
        GROUP BY st.id, s.display_name
      `;
      
      const result = await db.raw(query, [subtopicId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting subtopic stats:', error);
      throw new Error('Failed to get subtopic stats');
    }
  }
}

module.exports = new QuestionService();