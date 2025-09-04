const db = require('../config/database');

class AnkiService {
  async getDueCards(userId, options = {}) {
    const {
      newCardsLimit = 20,
      reviewCardsLimit = 100,
      learningCardsLimit = 100,
      subjectFilter = null,
      subtopicFilter = null,
      yearFilter = null
    } = options;

    try {
      // Get user settings
      const settings = await this.getUserSettings(userId);
      
      // Get cards by type
      const [newCards, learningCards, reviewCards] = await Promise.all([
        this.getNewCards(userId, { limit: newCardsLimit, subjectFilter, subtopicFilter, yearFilter }),
        this.getLearningCards(userId, { limit: learningCardsLimit, subjectFilter, subtopicFilter, yearFilter }),
        this.getReviewCards(userId, { limit: reviewCardsLimit, subjectFilter, subtopicFilter, yearFilter })
      ]);

      // Combine and prioritize cards
      const allCards = this.prioritizeCards([...newCards, ...learningCards, ...reviewCards], settings);
      
      return {
        cards: allCards,
        counts: {
          new: newCards.length,
          learning: learningCards.length,
          review: reviewCards.length,
          total: allCards.length
        }
      };
    } catch (error) {
      console.error('Error getting due cards:', error);
      throw new Error('Failed to get due cards');
    }
  }

  async getNewCards(userId, options = {}) {
    const { limit = 20, subjectFilter, subtopicFilter, yearFilter } = options;
    
    let query = `
      SELECT 
        ac.id as card_id,
        ac.card_type,
        ac.ease_factor,
        ac.interval_days,
        ac.repetitions,
        ac.lapses,
        ac.learning_step,
        ac.due_date,
        ac.total_reviews,
        ac.times_correct,
        q.id as question_id,
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
      WHERE ac.user_id = $1
        AND ac.card_type = 'new'
        AND NOT ac.is_suspended
        AND NOT ac.is_buried
        AND q.status = 'active'
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    if (subjectFilter && subjectFilter.length > 0) {
      query += ` AND q.subject_id = ANY($${paramIndex})`;
      params.push(subjectFilter);
      paramIndex++;
    }
    
    if (subtopicFilter && subtopicFilter.length > 0) {
      query += ` AND q.subtopic_id = ANY($${paramIndex})`;
      params.push(subtopicFilter);
      paramIndex++;
    }
    
    if (yearFilter && yearFilter.length > 0) {
      query += ` AND q.year = ANY($${paramIndex})`;
      params.push(yearFilter);
      paramIndex++;
    }
    
    query += ` ORDER BY ac.created_at LIMIT $${paramIndex}`;
    params.push(limit);
    
    return await db.raw(query, params);
  }

  async getLearningCards(userId, options = {}) {
    const { limit = 100, subjectFilter, subtopicFilter, yearFilter } = options;
    
    let query = `
      SELECT 
        ac.id as card_id,
        ac.card_type,
        ac.ease_factor,
        ac.interval_days,
        ac.repetitions,
        ac.lapses,
        ac.learning_step,
        ac.due_date,
        ac.total_reviews,
        ac.times_correct,
        q.id as question_id,
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
      WHERE ac.user_id = $1
        AND ac.card_type IN ('learning', 'relearning')
        AND ac.due_date <= NOW()
        AND NOT ac.is_suspended
        AND NOT ac.is_buried
        AND q.status = 'active'
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    if (subjectFilter && subjectFilter.length > 0) {
      query += ` AND q.subject_id = ANY($${paramIndex})`;
      params.push(subjectFilter);
      paramIndex++;
    }
    
    if (subtopicFilter && subtopicFilter.length > 0) {
      query += ` AND q.subtopic_id = ANY($${paramIndex})`;
      params.push(subtopicFilter);
      paramIndex++;
    }
    
    if (yearFilter && yearFilter.length > 0) {
      query += ` AND q.year = ANY($${paramIndex})`;
      params.push(yearFilter);
      paramIndex++;
    }
    
    query += ` ORDER BY ac.due_date LIMIT $${paramIndex}`;
    params.push(limit);
    
    return await db.raw(query, params);
  }

  async getReviewCards(userId, options = {}) {
    const { limit = 100, subjectFilter, subtopicFilter, yearFilter } = options;
    
    let query = `
      SELECT 
        ac.id as card_id,
        ac.card_type,
        ac.ease_factor,
        ac.interval_days,
        ac.repetitions,
        ac.lapses,
        ac.learning_step,
        ac.due_date,
        ac.total_reviews,
        ac.times_correct,
        q.id as question_id,
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
        st.display_name as subtopic_name,
        CASE WHEN ac.due_date < CURRENT_DATE THEN true ELSE false END as is_overdue
      FROM anki_cards ac
      JOIN questions q ON ac.question_id = q.id
      JOIN subjects s ON q.subject_id = s.id
      JOIN subtopics st ON q.subtopic_id = st.id
      WHERE ac.user_id = $1
        AND ac.card_type = 'review'
        AND DATE(ac.due_date) <= CURRENT_DATE
        AND NOT ac.is_suspended
        AND NOT ac.is_buried
        AND q.status = 'active'
    `;
    
    const params = [userId];
    let paramIndex = 2;
    
    if (subjectFilter && subjectFilter.length > 0) {
      query += ` AND q.subject_id = ANY($${paramIndex})`;
      params.push(subjectFilter);
      paramIndex++;
    }
    
    if (subtopicFilter && subtopicFilter.length > 0) {
      query += ` AND q.subtopic_id = ANY($${paramIndex})`;
      params.push(subtopicFilter);
      paramIndex++;
    }
    
    if (yearFilter && yearFilter.length > 0) {
      query += ` AND q.year = ANY($${paramIndex})`;
      params.push(yearFilter);
      paramIndex++;
    }
    
    query += ` ORDER BY ac.due_date LIMIT $${paramIndex}`;
    params.push(limit);
    
    return await db.raw(query, params);
  }

  prioritizeCards(cards, settings) {
    return cards.map(card => {
      let priority = 3; // default
      
      if (card.card_type === 'new') {
        priority = settings.show_new_cards_first ? 1 : 3;
      } else if (card.card_type === 'learning' || card.card_type === 'relearning') {
        priority = 2;
      } else if (card.card_type === 'review') {
        const isOverdue = new Date(card.due_date) < new Date();
        priority = isOverdue ? 1 : 3;
      }
      
      return { ...card, priority };
    }).sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }

  async processAnswer(userId, cardId, grade, responseTime, selectedOption, sessionId) {
    try {
      // Get card and settings
      const card = await this.getCardById(cardId, userId);
      const settings = await this.getUserSettings(userId);
      
      if (!card) {
        throw new Error('Card not found');
      }

      // Determine correctness
      const isCorrect = (selectedOption === card.correct_option) || ['good', 'easy'].includes(grade);
      
      // Store original state for logging
      const originalState = {
        cardType: card.card_type,
        interval: card.interval_days,
        easeFactor: parseFloat(card.ease_factor),
        repetitions: card.repetitions,
        lapses: card.lapses
      };
      
      // Apply Anki algorithm
      const newCardState = this.calculateNewCardState(card, grade, settings);
      newCardState.isCorrect = isCorrect;
      newCardState.responseTime = responseTime;
      
      // Update card in database
      await this.updateCard(cardId, newCardState);
      
      // Log the review
      await this.logReview({
        userId,
        cardId,
        sessionId,
        grade,
        selectedOption,
        isCorrect,
        responseTime,
        cardStateBefore: originalState,
        cardStateAfter: newCardState,
        wasFirstReview: originalState.cardType === 'new'
      });

      // Update question statistics
      await this.updateQuestionStats(card.question_id, isCorrect, responseTime);

      return {
        isCorrect,
        cardState: {
          cardType: newCardState.cardType,
          intervalDays: newCardState.intervalDays,
          dueDate: newCardState.dueDate,
          easeFactor: newCardState.easeFactor,
          repetitions: newCardState.repetitions,
          lapses: newCardState.lapses
        },
        nextReview: this.formatNextReview(newCardState)
      };
    } catch (error) {
      console.error('Error processing answer:', error);
      throw new Error('Failed to process answer');
    }
  }

  calculateNewCardState(card, grade, settings) {
    let newState = {
      cardType: card.card_type,
      easeFactor: parseFloat(card.ease_factor),
      intervalDays: card.interval_days,
      repetitions: card.repetitions,
      lapses: card.lapses,
      learningStep: card.learning_step,
      dueDate: card.due_date
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (card.card_type) {
      case 'new':
        switch (grade) {
          case 'again':
          case 'hard':
          case 'good':
            newState.cardType = 'learning';
            newState.learningStep = 0;
            const intervalMinutes = settings.learning_steps[0];
            newState.dueDate = new Date(now.getTime() + intervalMinutes * 60000);
            break;
          case 'easy':
            newState.cardType = 'review';
            newState.intervalDays = settings.easy_interval;
            newState.dueDate = new Date(today.getTime() + newState.intervalDays * 24 * 60 * 60 * 1000);
            newState.repetitions = 1;
            newState.easeFactor = settings.starting_ease;
            break;
        }
        break;

      case 'learning':
        switch (grade) {
          case 'again':
            newState.learningStep = 0;
            const againInterval = settings.learning_steps[0];
            newState.dueDate = new Date(now.getTime() + againInterval * 60000);
            newState.easeFactor = Math.max(1.30, newState.easeFactor - 0.20);
            break;
          case 'hard':
            const hardInterval = settings.learning_steps[Math.min(newState.learningStep, settings.learning_steps.length - 1)];
            newState.dueDate = new Date(now.getTime() + hardInterval * 60000);
            break;
          case 'good':
            if (newState.learningStep + 1 >= settings.learning_steps.length) {
              // Graduate to review
              newState.cardType = 'review';
              newState.intervalDays = settings.graduating_interval;
              newState.dueDate = new Date(today.getTime() + newState.intervalDays * 24 * 60 * 60 * 1000);
              newState.repetitions = 1;
              newState.easeFactor = settings.starting_ease;
              newState.learningStep = 0;
            } else {
              // Next learning step
              newState.learningStep += 1;
              const nextInterval = settings.learning_steps[newState.learningStep];
              newState.dueDate = new Date(now.getTime() + nextInterval * 60000);
            }
            break;
          case 'easy':
            newState.cardType = 'review';
            newState.intervalDays = settings.easy_interval;
                        newState.dueDate = new Date(today.getTime() + newState.intervalDays * 24 * 60 * 60 * 1000);
            newState.repetitions = 1;
            newState.easeFactor = settings.starting_ease;
            newState.learningStep = 0;
            break;
        }
        break;

      case 'review':
        switch (grade) {
          case 'again':
            newState.cardType = 'relearning';
            newState.learningStep = 0;
            const relearningInterval = settings.learning_steps[0];
            newState.dueDate = new Date(now.getTime() + relearningInterval * 60000);
            newState.lapses += 1;
            newState.easeFactor = Math.max(1.30, newState.easeFactor - 0.20);
            newState.repetitions = 0;
            break;
          case 'hard':
            newState.intervalDays = Math.max(
              settings.minimum_interval,
              Math.round(newState.intervalDays * settings.hard_interval_multiplier)
            );
            newState.dueDate = new Date(today.getTime() + newState.intervalDays * 24 * 60 * 60 * 1000);
            newState.repetitions += 1;
            newState.easeFactor = Math.max(1.30, newState.easeFactor - 0.15);
            break;
          case 'good':
            newState.intervalDays = Math.max(
              settings.minimum_interval,
              Math.round(newState.intervalDays * newState.easeFactor)
            );
            newState.dueDate = new Date(today.getTime() + newState.intervalDays * 24 * 60 * 60 * 1000);
            newState.repetitions += 1;
            break;
          case 'easy':
            newState.intervalDays = Math.max(
              settings.minimum_interval,
              Math.round(newState.intervalDays * newState.easeFactor * settings.easy_bonus)
            );
            newState.dueDate = new Date(today.getTime() + newState.intervalDays * 24 * 60 * 60 * 1000);
            newState.repetitions += 1;
            newState.easeFactor = Math.min(2.50, newState.easeFactor + 0.15);
            break;
        }
        break;

      case 'relearning':
        switch (grade) {
          case 'again':
            newState.learningStep = 0;
            const againRelearningInterval = settings.learning_steps[0];
            newState.dueDate = new Date(now.getTime() + againRelearningInterval * 60000);
            newState.easeFactor = Math.max(1.30, newState.easeFactor - 0.20);
            break;
          case 'hard':
            const hardRelearningInterval = settings.learning_steps[Math.min(newState.learningStep, settings.learning_steps.length - 1)];
            newState.dueDate = new Date(now.getTime() + hardRelearningInterval * 60000);
            break;
          case 'good':
            // Graduate back to review
            newState.cardType = 'review';
            newState.learningStep = 0;
            newState.intervalDays = Math.max(
              settings.minimum_interval,
              Math.round(card.interval_days * settings.new_interval_percentage)
            );
            if (newState.intervalDays === 0) {
              newState.intervalDays = settings.graduating_interval;
            }
            newState.dueDate = new Date(today.getTime() + newState.intervalDays * 24 * 60 * 60 * 1000);
            break;
          case 'easy':
            newState.cardType = 'review';
            newState.learningStep = 0;
            newState.intervalDays = Math.max(
              settings.minimum_interval,
              Math.round(card.interval_days * settings.new_interval_percentage * settings.easy_bonus)
            );
            if (newState.intervalDays === 0) {
              newState.intervalDays = settings.easy_interval;
            }
            newState.dueDate = new Date(today.getTime() + newState.intervalDays * 24 * 60 * 60 * 1000);
            break;
        }
        break;
    }

    return newState;
  }

  async getUserSettings(userId) {
    try {
      const settings = await db.select('anki_settings', {
        where: { user_id: userId }
      });
      
      return settings[0] || this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting user settings:', error);
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      learning_steps: [1, 10],
      graduating_interval: 1,
      easy_interval: 4,
      starting_ease: 2.50,
      easy_bonus: 1.30,
      hard_interval_multiplier: 1.20,
      minimum_interval: 1,
      show_new_cards_first: true
    };
  }

  async getCardById(cardId, userId) {
    const query = `
      SELECT ac.*, q.correct_option, q.question_id
      FROM anki_cards ac
      JOIN questions q ON ac.question_id = q.id
      WHERE ac.id = $1 AND ac.user_id = $2
    `;
    
    const result = await db.raw(query, [cardId, userId]);
    return result[0];
  }

  async updateCard(cardId, cardState) {
    const query = `
      UPDATE anki_cards SET
        card_type = $2,
        ease_factor = $3,
        interval_days = $4,
        repetitions = $5,
        lapses = $6,
        learning_step = $7,
        due_date = $8,
        total_reviews = total_reviews + 1,
        times_correct = CASE WHEN $9 THEN times_correct + 1 ELSE times_correct END,
        consecutive_correct = CASE WHEN $9 THEN consecutive_correct + 1 ELSE 0 END,
        total_time_seconds = total_time_seconds + COALESCE($10, 0),
        average_time_seconds = CASE 
          WHEN total_reviews = 0 THEN COALESCE($10, 0)
          ELSE (total_time_seconds + COALESCE($10, 0)) / (total_reviews + 1)
        END,
        last_review = NOW(),
        first_review = COALESCE(first_review, NOW()),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const params = [
      cardId,
      cardState.cardType,
      cardState.easeFactor,
      cardState.intervalDays,
      cardState.repetitions,
      cardState.lapses,
      cardState.learningStep,
      cardState.dueDate,
      cardState.isCorrect || false,
      cardState.responseTime || null
    ];
    
    const result = await db.raw(query, params);
    return result[0];
  }

  async logReview(reviewData) {
    await db.insert('review_log', {
      user_id: reviewData.userId,
      card_id: reviewData.cardId,
      session_id: reviewData.sessionId,
      review_grade: reviewData.grade,
      selected_option: reviewData.selectedOption,
      is_correct: reviewData.isCorrect,
      response_time_seconds: reviewData.responseTime,
      card_type_before: reviewData.cardStateBefore.cardType,
      interval_before: reviewData.cardStateBefore.interval,
      ease_factor_before: reviewData.cardStateBefore.easeFactor,
      card_type_after: reviewData.cardStateAfter.cardType,
      interval_after: reviewData.cardStateAfter.intervalDays,
      ease_factor_after: reviewData.cardStateAfter.easeFactor,
      was_first_review: reviewData.wasFirstReview || false,
      was_leech: reviewData.wasLeech || false
    });
  }

  async updateQuestionStats(questionId, isCorrect, responseTime) {
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
    `;
    
    await db.raw(query, [questionId, isCorrect ? 1 : 0, responseTime]);
  }

  formatNextReview(cardState) {
    if (cardState.cardType === 'learning' || cardState.cardType === 'relearning') {
      const diffMinutes = Math.round((new Date(cardState.dueDate) - new Date()) / (1000 * 60));
      return `${diffMinutes} minutes`;
    } else {
      return `${cardState.intervalDays} days`;
    }
  }

  async initializeCardForUser(userId, questionId) {
    try {
      // Check if card already exists
      const existingCard = await db.select('anki_cards', {
        where: { user_id: userId, question_id: questionId }
      });

      if (existingCard.length > 0) {
        return existingCard[0];
      }

      // Create new card
      const newCard = await db.insert('anki_cards', {
        user_id: userId,
        question_id: questionId,
        card_type: 'new',
        ease_factor: 2.50,
        interval_days: 0,
        repetitions: 0,
        lapses: 0,
        learning_step: 0,
        due_date: new Date(),
        is_suspended: false,
        is_buried: false
      });

      return newCard;
    } catch (error) {
      console.error('Error initializing card:', error);
      throw new Error('Failed to initialize card');
    }
  }
}

module.exports = new AnkiService();