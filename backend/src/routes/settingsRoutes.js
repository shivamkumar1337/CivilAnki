// routes/settings.js
const express = require("express");
const { Router } = express;
const { supabaseAnon } = require("../utils/supabaseClient");
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = Router();

// Get user's spaced repetition settings
router.get("/spaced-repetition", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAnon
      .from("spaced_repetition_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Return default settings if none found
    if (!data) {
      const defaultSettings = {
        learning_steps: [1, 10],
        graduating_interval: 1,
        easy_interval: 4,
        starting_ease: 2.5,
        easy_bonus: 1.3,
        interval_modifier: 1.0,
        hard_interval: 1.2,
        new_interval: 0.0,
        minimum_interval: 1,
        leech_threshold: 8
      };

      // Create default settings for user
      const { data: newSettings, error: createError } = await supabaseAnon
        .from("spaced_repetition_settings")
        .insert({ user_id: userId, ...defaultSettings })
        .select()
        .single();

      if (createError) throw createError;
      return res.json({ success: true, data: newSettings });
    }

    res.json({ success: true, data });

  } catch (e) {
    console.error("GET /settings/spaced-repetition error:", e);
    next(e);
  }
});

// Update user's spaced repetition settings
router.put("/spaced-repetition", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const settings = req.body;

    const { data, error } = await supabaseAnon
      .from("spaced_repetition_settings")
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: "Settings updated successfully"
    });

  } catch (e) {
    console.error("PUT /settings/spaced-repetition error:", e);
    next(e);
  }
});

module.exports = router;