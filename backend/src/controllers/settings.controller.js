const db = require('../config/database');

class SettingsController {
  async getAnkiSettings(req, res, next) {
    try {
      const userId = req.userId;
      
      const settings = await db.select('anki_settings', {
        where: { user_id: userId }
      });

      if (settings.length === 0) {
        // Create default settings
        const defaultSettings = {
          user_id: userId,
          learning_steps: [1, 10],
          graduating_interval: 1,
          easy_interval: 4,
          starting_ease: 2.50,
          easy_bonus: 1.30,
          interval_modifier: 1.00,
          maximum_interval: 36500,
          hard_interval_multiplier: 1.20,
          new_interval_percentage: 0.00,
          minimum_interval: 1,
          leech_threshold: 8,
          leech_action: 'suspend',
          new_cards_per_day: 20,
          maximum_reviews_per_day: 200,
          show_new_cards_first: true
        };

        const newSettings = await db.insert('anki_settings', defaultSettings);
        return res.json({
          success: true,
          data: newSettings
        });
      }

      res.json({
        success: true,
        data: settings[0]
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnkiSettings(req, res, next) {
    try {
      const userId = req.userId;
      const updates = req.body;

      // Remove user_id from updates if present
      delete updates.user_id;
      delete updates.id;
      delete updates.created_at;
      delete updates.updated_at;

      const updatedSettings = await db.update('anki_settings', updates, {
        user_id: userId
      });

      res.json({
        success: true,
        data: updatedSettings[0]
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPreferences(req, res, next) {
    try {
      const userId = req.userId;
      
      const user = await db.select('user_profiles', {
        where: { id: userId },
        select: 'id, full_name, email, mobile_number, daily_goal, timezone, theme_preference, language_preference'
      });

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user[0]
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserPreferences(req, res, next) {
    try {
      const userId = req.userId;
      const updates = req.body;

      // Remove sensitive fields
      delete updates.id;
      delete updates.email;
      delete updates.google_id;
      delete updates.created_at;
      delete updates.updated_at;
      delete updates.study_streak;
      delete updates.total_questions_answered;
      delete updates.total_correct_answers;
      delete updates.overall_accuracy;

      const updatedUser = await db.update('user_profiles', updates, {
        id: userId
      });

      res.json({
        success: true,
        data: updatedUser[0]
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMobileNumber(req, res, next) {
    try {
      const userId = req.userId;
      const { mobile_number } = req.body;

      if (!mobile_number || !/^\+91[6-9][0-9]{9}$/.test(mobile_number)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid mobile number format. Use +91XXXXXXXXXX'
        });
      }

      // Check if mobile number already exists
      const existingUser = await db.select('user_profiles', {
        where: { mobile_number }
      });

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return res.status(409).json({
          success: false,
          error: 'Mobile number already registered'
        });
      }

      const updatedUser = await db.update('user_profiles', 
        { mobile_number }, 
        { id: userId }
      );

      res.json({
        success: true,
        data: updatedUser[0]
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SettingsController();