const db = require('../config/database');
const ankiService = require('../services/anki.service');

class QuestionsController {
  async getSubjects(req, res, next) {
    try {
      const subjects = await db.select('subjects', {
        where: { is_active: true },
        order: { column: 'display_order', ascending: true }
      });

      res.json({
        success: true,
        data: subjects
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubtopics(req, res, next) {
    try {
            const { subjectId } = req.params;
      
      const subtopics = await db.select('subtopics', {
        where: { subject_id: subjectId, is_active: true },
        order: { column: 'display_order', ascending: true }
      });

      res.json({
        success: true,
        data: subtopics
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuestions(req, res, next) {
    try {
      const userId = req.userId;
      const {
        subject_id,
        subtopic_id,
        year,
        difficulty,
        limit = 50,
        offset = 0
      } = req.query;

      let query = `
        SELECT 
          q.*,
          s.display_name as subject_name,
          st.display_name as subtopic_name,
          ac.id as card_id,
          ac.card_type,
          ac.due_date,
          ac.interval_days
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
        LEFT JOIN anki_cards ac ON q.id = ac.question_id AND ac.user_id = $1
        WHERE q.status = 'active'
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

      if (year) {
        query += ` AND q.year = $${paramIndex}`;
        params.push(parseInt(year));
        paramIndex++;
      }

      if (difficulty) {
        query += ` AND q.difficulty = $${paramIndex}`;
        params.push(difficulty);
        paramIndex++;
      }

      query += ` ORDER BY q.year DESC, q.question_number`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(parseInt(limit), parseInt(offset));

      const questions = await db.raw(query, params);

      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuestionById(req, res, next) {
    try {
      const userId = req.userId;
      const { questionId } = req.params;

      const query = `
        SELECT 
          q.*,
          s.display_name as subject_name,
          st.display_name as subtopic_name,
          ac.id as card_id,
          ac.card_type,
          ac.due_date,
          ac.interval_days,
          ac.total_reviews,
          ac.times_correct
        FROM questions q
        JOIN subjects s ON q.subject_id = s.id
        JOIN subtopics st ON q.subtopic_id = st.id
        LEFT JOIN anki_cards ac ON q.id = ac.question_id AND ac.user_id = $1
        WHERE q.id = $2 AND q.status = 'active'
      `;

      const result = await db.raw(query, [userId, questionId]);
      const question = result[0];

      if (!question) {
        return res.status(404).json({
          success: false,
          error: 'Question not found'
        });
      }

      // Initialize card if it doesn't exist
      if (!question.card_id) {
        const card = await ankiService.initializeCardForUser(userId, questionId);
        question.card_id = card.id;
        question.card_type = card.card_type;
        question.due_date = card.due_date;
        question.interval_days = card.interval_days;
        question.total_reviews = card.total_reviews;
        question.times_correct = card.times_correct;
      }

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      next(error);
    }
  }

  async searchQuestions(req, res, next) {
    try {
      const userId = req.userId;
      const { 
        q: searchQuery, 
        subject_id, 
        year_from, 
        year_to, 
        limit = 20 
      } = req.query;

      if (!searchQuery || searchQuery.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Search query must be at least 3 characters long'
        });
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
        params.push(parseInt(year_from));
        paramIndex++;
      }

      if (year_to) {
        query += ` AND q.year <= $${paramIndex}`;
        params.push(parseInt(year_to));
        paramIndex++;
      }

      query += ` ORDER BY rank DESC, q.year DESC LIMIT $${paramIndex}`;
      params.push(parseInt(limit));

      const results = await db.raw(query, params);

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuestionsController();