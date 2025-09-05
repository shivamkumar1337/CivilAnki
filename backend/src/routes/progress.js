const express = require("express");
const { Router } = express;
const { supabaseAnon } = require("../utils/supabaseClient");

const router = Router();

/* GET /progress?status=due|today|all */
router.get("/", async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw { status: 401, message: "Missing token" };

    const { data: auth } = await supabaseAnon.auth.getUser(token);
    const userId = auth.user?.id;
    const status = req.query.status;

    let q = supabaseAnon
      .from("user_question_progress")
      .select(
        `question_id, attempts, correct, review_interval, next_review_at, 
         questions!inner(question_text, options, correct_option, year, 
           subject_id, topics!inner(name)`
      )
      .eq("user_id", userId);

    if (status === "due") {
      q = q.lte("next_review_at", new Date().toISOString());
    } else if (status === "today") {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      q = q.lte("next_review_at", end.toISOString());
    }

    const { data, error } = await q.order("next_review_at", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
