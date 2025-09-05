const express = require("express");
const { Router } = express;
const { supabaseAnon } = require("../utils/supabaseClient");

const router = Router();

// Get topics for a subject
router.get("/:subjectId", async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { data, error } = await supabaseAnon
      .from("topics")
      .select("*")
      .eq("subject_id", subjectId);
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
