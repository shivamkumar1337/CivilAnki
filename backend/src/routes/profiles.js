const express = require("express");
const { Router } = express;
const { supabase } = require("../utils/supabaseClient");

const router = Router();

// Get user profile
router.get("/", async (req, res, next) => {
  try {
    console.log("Fetching profile...");
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw { status: 401, message: "Missing token" };

    const { data: auth } = await supabase.auth.getUser(token);
    console.log("Auth data:", auth);
    const userId = auth.user?.id;
    if (!userId) throw { status: 401, message: "Invalid user" };

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    console.log("Fetched profile for userId:", userId, data);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// Create new profile
router.post("/", async (req, res) => {
  try {
    const { id, name, goal, target_year, mobile, email } = req.body;
    if (!id || !name || !goal || !target_year || !mobile) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const { data, error } = await supabase
      .from("profiles")
      .insert([{ id, name, goal, target_year, mobile, email }])
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
