const supabase = require('../config/supabase');
const db = require('../config/database');

class AuthController {
  async getProfile(req, res, next) {
    try {
      const userId = req.userId;
      
      const user = await db.select('user_profiles', {
        where: { id: userId }
      });

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found'
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

  async updateProfile(req, res, next) {
    try {
      const userId = req.userId;
      const updates = req.body;

      // Remove sensitive fields
      delete updates.id;
      delete updates.email;
      delete updates.google_id;
      delete updates.created_at;
      delete updates.updated_at;

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

  async deleteAccount(req, res, next) {
    try {
      const userId = req.userId;

      // Delete user data (cascading deletes will handle related data)
      await db.delete('user_profiles', { id: userId });

      // Delete from Supabase auth
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        console.error('Error deleting user from Supabase:', error);
      }

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();