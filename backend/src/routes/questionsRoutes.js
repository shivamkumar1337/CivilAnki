const express = require("express");
const { Router } = express;
const { supabaseAnon } = require("../utils/supabaseClient");

const router = Router();

// Get questions (optionally filter by subject, topic, year)
router.get("/", async (req, res, next) => {
  try {
    let q = supabaseAnon.from("questions").select("*");
    const { subject, topic, year } = req.query;
    console.log("Query parameters:", req.query);


    if (subject) q = q.eq("subject_id", subject);
    if (topic) q = q.eq("topic_id", topic);
    if (year) q = q.eq("year", year);

    const { data, error } = await q;
      console.log("Supabase response:", { data, error });
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
