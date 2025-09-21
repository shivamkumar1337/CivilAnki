// routes/progress.js
const express = require("express");
const { Router } = express;
const { supabaseAnon } = require("../utils/supabaseClient");
const { authMiddleware } = require('../middlewares/authMiddleware');
const SpacedRepetitionService = require("../services/SpacedRepetitionService");
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

/* GET /progress?status=due|today|all|unattempted|learning|review&subject_id=1&topic_id=52&exam_id=1&year=2023 */
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    console.log("Query parameters:", req.query);
    const userId = req.user.id;
    const { status, limit = 50, ...filters } = req.query;
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
          topic_id,
          exam_id,
          image_url
        `)
        .limit(parseInt(limit));

      query = applyFilters(query, filters);
      const { data: allQuestions, error } = await query;

      if (error) throw error;
      
      data = allQuestions.map(item => ({
        question_id: item.id,
        question_text: item.question_text,
        options: item.options,
        correct_option: item.correct_option,
        year: item.year,
        subject_id: item.subject_id,
        topic_id: item.topic_id,
        exam_id: item.exam_id,
        image_url: item.image_url,
        card_type: 'new'
      }));

    } else if (status === "unattempted" || status === "new") {
      // Get questions that are NOT in user_question_progress table
      const { data: attemptedIds, error: attemptedError } = await supabaseAnon
        .from("user_question_progress")
        .select("question_id")
        .eq("user_id", userId);

      if (attemptedError) throw attemptedError;

      const attemptedQuestionIds = attemptedIds.map(item => item.question_id);

      let query = supabaseAnon
        .from("questions")
        .select(`
          id,
          question_text,
          options,
          correct_option,
          year,
          subject_id,
          topic_id,
          exam_id,
          image_url
        `)
        .limit(parseInt(limit));

      query = applyFilters(query, filters);

      if (attemptedQuestionIds.length > 0) {
        query = query.not("id", "in", `(${attemptedQuestionIds.join(",")})`);
      }

      const { data: unattemptedData, error } = await query;
      if (error) throw error;
      
      data = unattemptedData.map(item => ({
        question_id: item.id,
        question_text: item.question_text,
        options: item.options,
        correct_option: item.correct_option,
        year: item.year,
        subject_id: item.subject_id,
        topic_id: item.topic_id,
        exam_id: item.exam_id,
        image_url: item.image_url,
        card_type: 'new'
      }));

    } else {
      // Build query for spaced repetition cards
      let q = supabaseAnon
        .from("user_question_progress")
        .select(`
          question_id, 
          attempts, 
          correct, 
          review_interval,
          next_review_at,
          last_attempt_at,
          ease_factor,
          interval_days,
          repetitions,
          quality,
          card_type,
          step_index,
          graduated_at,
          lapses,
          questions!inner(
            question_text, 
            options, 
            correct_option, 
            year,
            subject_id, 
            topic_id,
            exam_id,
            image_url,
            topics!inner(name)
          )
        `)
        .eq("user_id", userId)
        .limit(parseInt(limit));

      query = applyFilters(q, filters, 'questions');

      // Apply status filters for spaced repetition
      if (status === "due") {
        q = q.lte("next_review_at", new Date().toISOString());
      } else if (status === "today") {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        q = q.lte("next_review_at", endOfDay.toISOString());
      } else if (status === "learning") {
        q = q.eq("card_type", "learning");
      } else if (status === "review") {
        q = q.eq("card_type", "review");
      } else if (status === "relearning") {
        q = q.eq("card_type", "relearning");
      }

      const { data: progressData, error } = await q.order("next_review_at", { ascending: true });
      if (error) throw error;

      data = progressData.map(item => ({
        question_id: item.question_id,
        question_text: item.questions.question_text,
        options: item.questions.options,
        correct_option: item.questions.correct_option,
        year: item.questions.year,
        subject_id: item.questions.subject_id,
        topic_id: item.questions.topic_id,
        exam_id: item.questions.exam_id,
        image_url: item.questions.image_url,
        // Spaced repetition fields
        attempts: item.attempts,
        correct: item.correct,
        review_interval: item.review_interval,
        next_review_at: item.next_review_at,
        last_attempt_at: item.last_attempt_at,
        ease_factor: item.ease_factor,
        interval_days: item.interval_days,
        repetitions: item.repetitions,
        quality: item.quality,
        card_type: item.card_type || 'learning',
        step_index: item.step_index,
        graduated_at: item.graduated_at,
        lapses: item.lapses,
        topic_name: item.questions.topics.name
      }));
    }

    // Get counts for dashboard
    const counts = await getProgressCounts(userId);

    res.json({
      questions: data,
      count: data.length,
      status: status || 'all',
      filters: filters,
      counts: counts
    });

  } catch (e) {
    console.error("Full error:", e);
    next(e);
  }
});

/* POST /progress - Submit answer and update spaced repetition */
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (!userId) throw { status: 401, message: "Invalid user" };

    const { question_id, quality, time_taken } = req.body;

    // Validate required fields
    if (!question_id || quality === undefined || quality < 0 || quality > 5) {
      throw { 
        status: 400, 
        message: "Missing or invalid fields: question_id, quality (0-5)" 
      };
    }

    // Get current progress if exists
    const { data: currentProgress, error: fetchError } = await supabaseAnon
      .from("user_question_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("question_id", question_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw fetchError;
    }

    // Get user's spaced repetition settings
    const settings = await SpacedRepetitionService.getUserSettings(supabaseAnon, userId);

    // Calculate next review using spaced repetition
    const updatedProgress = SpacedRepetitionService.calculateNextReview(
      currentProgress || {
        user_id: userId,
        question_id: question_id,
        attempts: 0,
        card_type: 'learning',
        step_index: 0,
        repetitions: 0,
        ease_factor: settings.startingEase,
        interval_days: 1,
        lapses: 0
      },
      quality,
      settings
    );

    // Add additional fields
    updatedProgress.user_id = userId;
    updatedProgress.question_id = question_id;
    updatedProgress.correct = quality >= 2; // Good or better
    // updatedProgress.time_taken = time_taken;

    // Upsert the progress
    const { data, error } = await supabaseAnon
      .from("user_question_progress")
      .upsert(updatedProgress, {
        onConflict: 'user_id,question_id'
      })
      .select()
      .single();

    if (error) throw error;

    // Check if card is a leech
    const isLeech = SpacedRepetitionService.isLeech(data, settings);
    
    res.json({
      success: true,
      data: {
        ...data,
        is_leech: isLeech
      },
      message: "Progress saved successfully",
      next_review_in_minutes: Math.round((new Date(data.next_review_at) - new Date()) / (1000 * 60))
    });

  } catch (e) {
    console.error("POST /progress error:", e);
    next(e);
  }
});

/* GET /progress/stats - Get user's progress statistics */
router.get("/stats", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const counts = await getProgressCounts(userId);
    
    res.json({
      success: true,
      data: counts
    });

  } catch (e) {
    console.error("GET /progress/stats error:", e);
    next(e);
  }
});

// Helper function to get progress counts
async function getProgressCounts(userId) {
  const now = new Date().toISOString();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const queries = await Promise.all([
    // New cards (unattempted)
    supabaseAnon.from("questions").select("id", { count: 'exact', head: true }),
    supabaseAnon.from("user_question_progress").select("question_id", { count: 'exact', head: true }).eq("user_id", userId),
    
    // Learning cards
    supabaseAnon.from("user_question_progress").select("*", { count: 'exact', head: true })
      .eq("user_id", userId).eq("card_type", "learning"),
    
    // Review cards
    supabaseAnon.from("user_question_progress").select("*", { count: 'exact', head: true })
      .eq("user_id", userId).eq("card_type", "review"),
    
    // Due cards
    supabaseAnon.from("user_question_progress").select("*", { count: 'exact', head: true })
      .eq("user_id", userId).lte("next_review_at", now),
    
    // Today's cards
    supabaseAnon.from("user_question_progress").select("*", { count: 'exact', head: true })
      .eq("user_id", userId).lte("next_review_at", endOfDay.toISOString()),
  ]);

  const totalQuestions = queries[0].count || 0;
  const attemptedQuestions = queries[1].count || 0;
  
  return {
    new: totalQuestions - attemptedQuestions,
    learning: queries[2].count || 0,
    review: queries[3].count || 0,
    due: queries[4].count || 0,
    today: queries[5].count || 0,
    total: totalQuestions
  };
}

/* DELETE /progress/:questionId - Reset question progress */
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
      message: "Progress reset successfully"
    });

  } catch (e) {
    console.error("DELETE /progress error:", e);
    next(e);
  }
});

module.exports = router;