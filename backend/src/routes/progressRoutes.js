const express = require("express");
const { Router } = express;
const { supabaseAnon } = require("../utils/supabaseClient");
const { authMiddleware } = require('../middlewares/authMiddleware');
const router = Router();

// Helper function to apply filters conditionally
const applyFilters = (query, filters, tablePrefix = '') => {
  const prefix = tablePrefix ? `${tablePrefix}.` : '';
  
  if (filters.subject_id) query = query.eq(`${prefix}subject_id`, filters.subject_id);
  if (filters.topic_id) query = query.eq(`${prefix}topic_id`, filters.topic_id);
  if (filters.exam_id) query = query.eq(`${prefix}exam_id`, filters.exam_id);
  if (filters.year) query = query.eq(`${prefix}year`, filters.year);
  
  return query;
};

/* GET /progress?status=due|today|all|unattempted&subject_id=1&topic_id=52&exam_id=1&year=2023 */
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    console.log("Query parameters:", req.query);
    const userId = req.user.id;
    const { status, ...filters } = req.query;
    let data;

    if (status === "all") {
      // Return all questions from questions table with filters applied
      let query = supabaseAnon
        .from("questions")
        .select(`
          id,
          question_text,
          options,
          correct_option,
          year,
          subject_id,
          topic_id
        `);

      // Apply filters using helper function
      query = applyFilters(query, filters);
      const { data: allQuestions, error } = await query;

      if (error) {
        console.error("Error fetching all questions:", error);
        throw error;
      }
      
      // Map the response to consistent format
      data = allQuestions.map(item => ({
        question_id: item.id,
        question_text: item.question_text,
        options: item.options,
        correct_option: item.correct_option,
        year: item.year,
        subject_id: item.subject_id,
        topic_id: item.topic_id
      }));

    } else if (status === "unattempted") {
      // Get questions that are NOT in user_question_progress table but are in questions table
      const { data: attemptedIds, error: attemptedError } = await supabaseAnon
        .from("user_question_progress")
        .select("question_id")
        .eq("user_id", userId);

      if (attemptedError) throw attemptedError;

      // Extract the IDs into an array
      const attemptedQuestionIds = attemptedIds.map(item => item.question_id);
      console.log("Attempted question IDs:", attemptedQuestionIds);

      // Build query for unattempted questions
      let query = supabaseAnon
        .from("questions")
        .select(`
          id,
          question_text,
          options,
          correct_option,
          year,
          subject_id,
          topic_id
        `);

      // Apply filters using helper function
      query = applyFilters(query, filters);

      // If there are attempted questions, exclude them
      if (attemptedQuestionIds.length > 0) {
        query = query.not("id", "in", `(${attemptedQuestionIds.join(",")})`);
      }

      const { data: unattemptedData, error } = await query;

      if (error) {
        console.error("Error fetching unattempted questions:", error);
        throw error;
      }
      
      // Map the response to consistent format
      data = unattemptedData.map(item => ({
        question_id: item.id,
        question_text: item.question_text,
        options: item.options,
        correct_option: item.correct_option,
        year: item.year,
        subject_id: item.subject_id,
        topic_id: item.topic_id
      }));

    } else {
      // Build query for attempted questions (due, today, or specific progress status)
      let q = supabaseAnon
        .from("user_question_progress")
        .select(`
          question_id, 
          attempts, 
          correct, 
          review_interval, 
          next_review_at,
          last_attempt_at,
          questions!inner(
            question_text, 
            options, 
            correct_option, 
            year,
            subject_id, 
            topic_id,
            topics!inner(name)
          )
        `)
        .eq("user_id", userId);

      // Apply filters using helper function with table prefix
      q = applyFilters(q, filters, 'questions');

      // Apply status filters
      if (status === "due") {
        q = q.lte("next_review_at", new Date().toISOString());
      } else if (status === "today") {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        q = q.lte("next_review_at", end.toISOString());
      }

      const { data: progressData, error } = await q.order("next_review_at", { ascending: true });
      if (error) throw error;

      // **FIXED: Transform the nested response to match consistent format**
      data = progressData.map(item => ({
        question_id: item.question_id,
        question_text: item.questions.question_text,
        options: item.questions.options,
        correct_option: item.questions.correct_option,
        year: item.questions.year,
        subject_id: item.questions.subject_id,
        topic_id: item.questions.topic_id,
        // Include progress-specific fields for due/today status
        attempts: item.attempts,
        correct: item.correct,
        review_interval: item.review_interval,
        next_review_at: item.next_review_at,
        last_attempt_at: item.last_attempt_at,
        topic_name: item.questions.topics.name
      }));
    }

    // Return data with count
    res.json({
      questions: data,
      count: data.length,
      status: status || 'all',
      filters: filters
    });

  } catch (e) {
    console.error("Full error:", e);
    next(e);
  }
});

/* POST /progress - Upsert user progress */
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw { status: 401, message: "Invalid user" };

    const { question_id, correct, review_interval, next_review_at } = req.body;

    // Validate required fields
    if (!question_id || typeof correct !== 'boolean' || !review_interval || !next_review_at) {
      throw { 
        status: 400, 
        message: "Missing required fields: question_id, correct, review_interval, next_review_at" 
      };
    }

    // Use upsert to either insert new or update existing progress
    const { data, error } = await supabaseAnon
      .from("user_question_progress")
      .upsert({
        user_id: userId,
        question_id: question_id,
        correct: correct,
        review_interval: review_interval,
        next_review_at: next_review_at,
        last_attempt_at: new Date().toISOString(),
        attempts: 1 // Will be incremented by trigger on conflict
      })
      .select();

    if (error) throw error;
    
    res.json({
      success: true,
      data: data[0],
      message: "Progress saved successfully"
    });

  } catch (e) {
    console.error("POST /progress error:", e);
    next(e);
  }
});

/* DELETE /progress/:questionId - Delete specific question progress */
router.delete("/:questionId", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw { status: 401, message: "Invalid user" };

    const questionId = req.params.questionId;

    const { data, error } = await supabaseAnon
      .from("user_question_progress")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .select();

    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw { status: 404, message: "Progress record not found" };
    }

    res.json({
      success: true,
      data: data[0],
      message: "Progress deleted successfully"
    });

  } catch (e) {
    console.error("DELETE /progress error:", e);
    next(e);
  }
});

module.exports = router;
