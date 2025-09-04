const supabase = require('../config/supabase');
const db = require('../config/database');

class AuthService {
  async getUserById(userId) {
    try {
      const users = await db.select('user_profiles', {
        where: { id: userId }
      });
      
      return users[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw new Error('Failed to get user');
    }
  }

  async getUserByEmail(email) {
    try {
      const users = await db.select('user_profiles', {
        where: { email: email }
      });
      
      return users[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to get user');
    }
  }

  async getUserByMobile(mobileNumber) {
    try {
      const users = await db.select('user_profiles', {
        where: { mobile_number: mobileNumber }
      });
      
      return users[0] || null;
    } catch (error) {
      console.error('Error getting user by mobile:', error);
      throw new Error('Failed to get user');
    }
  }

  async updateUserProfile(userId, updates) {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const sanitizedUpdates = { ...updates };
      delete sanitizedUpdates.id;
      delete sanitizedUpdates.email;
      delete sanitizedUpdates.google_id;
      delete sanitizedUpdates.created_at;
      delete sanitizedUpdates.updated_at;
      delete sanitizedUpdates.study_streak;
      delete sanitizedUpdates.total_questions_answered;
      delete sanitizedUpdates.total_correct_answers;
      delete sanitizedUpdates.overall_accuracy;

      const updatedUsers = await db.update('user_profiles', sanitizedUpdates, {
        id: userId
      });
      
      return updatedUsers[0] || null;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  async updateMobileNumber(userId, mobileNumber) {
    try {
      // Check if mobile number is already taken
      const existingUser = await this.getUserByMobile(mobileNumber);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Mobile number already registered');
      }

      const updatedUsers = await db.update('user_profiles', 
        { mobile_number: mobileNumber }, 
        { id: userId }
      );
      
      return updatedUsers[0] || null;
    } catch (error) {
      console.error('Error updating mobile number:', error);
      throw error;
    }
  }

  async verifyUserToken(token) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        throw new Error('Invalid token');
      }
      
      return user;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new Error('Token verification failed');
    }
  }

  async refreshUserToken(refreshToken) {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });
      
      if (error) {
        throw new Error('Token refresh failed');
      }
      
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  async deleteUserAccount(userId) {
    try {
      // Delete user profile (cascading deletes will handle related data)
      await db.delete('user_profiles', { id: userId });
      
      // Delete from Supabase auth
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        console.error('Error deleting user from Supabase auth:', error);
        // Don't throw here as profile is already deleted
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw new Error('Failed to delete user account');
    }
  }

  async getUserStats(userId) {
    try {
      const query = `
        SELECT 
          up.*,
          COUNT(DISTINCT ac.id) as total_cards,
          COUNT(DISTINCT ac.id) FILTER (WHERE ac.card_type = 'review' AND ac.interval_days > 21) as mastered_cards,
          COUNT(DISTINCT ss.id) FILTER (WHERE ss.completed = true) as total_sessions,
          COUNT(DISTINCT ss.id) FILTER (WHERE ss.session_start >= CURRENT_DATE - INTERVAL '7 days' AND ss.completed = true) as sessions_this_week,
          MAX(ss.session_start) as last_session_date
        FROM user_profiles up
        LEFT JOIN anki_cards ac ON up.id = ac.user_id
        LEFT JOIN study_sessions ss ON up.id = ss.user_id
        WHERE up.id = $1
        GROUP BY up.id
      `;
      
      const result = await db.raw(query, [userId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to get user stats');
    }
  }

  async updateUserStats(userId, stats) {
    try {
      const updates = {
        total_questions_answered: stats.totalQuestions || 0,
        total_correct_answers: stats.correctAnswers || 0,
        overall_accuracy: stats.accuracy || 0
      };

      const updatedUsers = await db.update('user_profiles', updates, {
        id: userId
      });
      
      return updatedUsers[0] || null;
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw new Error('Failed to update user stats');
    }
  }

  async checkUserExists(email, mobileNumber = null) {
    try {
      let query = 'SELECT id, email, mobile_number FROM user_profiles WHERE email = $1';
      const params = [email];
      
      if (mobileNumber) {
        query += ' OR mobile_number = $2';
        params.push(mobileNumber);
      }
      
      const users = await db.raw(query, params);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error checking user exists:', error);
      throw new Error('Failed to check user existence');
    }
  }
}

module.exports = new AuthService();