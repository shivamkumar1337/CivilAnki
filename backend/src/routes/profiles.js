const express = require("express");
const { Router } = express;
const { supabaseAnon } = require("../utils/supabaseClient");

const router = Router();

// Get user profile
router.get("/", async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw { status: 401, message: "Missing token" };

    const { data: auth } = await supabaseAnon.auth.getUser(token);
    const userId = auth.user?.id;
    if (!userId) throw { status: 401, message: "Invalid user" };

    const { data, error } = await supabaseAnon
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
