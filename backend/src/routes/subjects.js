const express = require("express");
const { Router } = express;
const { supabaseAnon } = require("../utils/supabaseClient");

const router = Router();

// Get all subjects
router.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAnon.from("subjects").select("*");
    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
