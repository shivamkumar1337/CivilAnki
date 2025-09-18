/**
 * Profile Controller
 * Simple profile controller with basic JSON responses
 */

const ProfileService = require('../services/ProfileService');

class ProfileController {
  /**
   * Get current user profile
   * GET /profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User ID not found in request'
        });
      }

      const profile = await ProfileService.getProfile(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        profile: profile
      });
    } catch (error) {
      console.error('Get profile controller error:', error);
      
      const statusCode = error.message === 'Profile not found' ? 404 : 500;
      
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update current user profile
   * PUT /profile
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user?.id;
      const updates = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User ID not found in request'
        });
      }

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No update data provided'
        });
      }

      const profile = await ProfileService.updateProfile(userId, updates);
      
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile: profile
      });
    } catch (error) {
      console.error('Update profile controller error:', error);
      
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Update user streak
   * PUT /profile/streak
   */
  static async updateStreak(req, res) {
    try {
      const userId = req.user?.id;
      const { streak } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User ID not found in request'
        });
      }

      if (streak === undefined || streak === null) {
        return res.status(400).json({
          success: false,
          error: 'Streak value is required'
        });
      }

      const profile = await ProfileService.updateStreak(userId, streak);
      
      return res.status(200).json({
        success: true,
        message: 'Streak updated successfully',
        profile: profile
      });
    } catch (error) {
      console.error('Update streak controller error:', error);
      
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = ProfileController;
