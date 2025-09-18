/**
 * Profile Service
 * Complete profile service with all CRUD operations and validation
 */

const { supabaseAnon } = require('../config/supabaseClient');

class ProfileService {
  /**
   * Validate name
   */
  static validateName(name) {
    if (!name || typeof name !== 'string') {
      return { isValid: false, message: 'Name is required' };
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters' };
    }

    if (trimmedName.length > 50) {
      return { isValid: false, message: 'Name must be less than 50 characters' };
    }

    // Check for valid characters (letters, spaces, apostrophes, hyphens)
    if (!/^[a-zA-Z\s.''-]+$/.test(trimmedName)) {
      return { isValid: false, message: 'Name can only contain letters, spaces, and basic punctuation' };
    }

    return { isValid: true, cleaned: trimmedName };
  }

  /**
   * Validate email
   */
  static validateEmail(email) {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    // Additional checks
    if (email.length > 254) {
      return { isValid: false, message: 'Email is too long' };
    }

    return { isValid: true };
  }

  /**
   * Validate Indian phone number
   */
  static validateIndianPhone(phone) {
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    const cleanPhone = phone.replace(/[^\d]/g, '');

    // Check 10-digit format starting with 6-9
    if (/^[6-9]\d{9}$/.test(cleanPhone)) {
      return { isValid: true, formatted: `+91${cleanPhone}` };
    }

    // Check 12-digit format with 91 prefix
    if (/^91[6-9]\d{9}$/.test(cleanPhone)) {
      return { isValid: true, formatted: `+${cleanPhone}` };
    }

    // Check 13-digit format with +91 prefix
    if (/^\+91[6-9]\d{9}$/.test(phone)) {
      return { isValid: true, formatted: phone };
    }

    return { 
      isValid: false, 
      message: 'Invalid Indian phone number format. Use 10 digits starting with 6-9' 
    };
  }

  /**
   * Validate URL
   */
  static validateURL(url) {
    if (!url) {
      return { isValid: false, message: 'URL is required' };
    }

    try {
      new URL(url);
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: 'Invalid URL format' };
    }
  }

  /**
   * Get user profile by auth user ID
   */
  static async getProfile(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data: profile, error } = await supabaseAnon
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Profile not found');
        }
        throw error;
      }

      return profile;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }



  /**
   * Create new profile
   */
  static async createProfile({ phone, status=0 ,id }) {
  const { data, error } = await supabaseAnon
    .from('profiles')
    .insert({
      phone,
      status,
      id
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create user profile: ${error.message}`);
  return data;
}

  /**
   * Update user profile
   */
  static async updateProfile(id, updates) {
    try {
      const { data: profile, error } = await supabaseAnon
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw new Error(error.message);
      }

      return profile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Delete user profile
   */
  static async deleteProfile(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Check if profile exists first
      const existingProfile = await this.getProfile(userId);
      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      const { error } = await supabaseAnon
        .from('profiles')
        .delete()
        .eq('auth_user_id', userId);

      if (error) {
        console.error('Delete profile error:', error);
        throw new Error(error.message);
      }

      return { message: 'Profile deleted successfully' };
    } catch (error) {
      console.error('Delete profile error:', error);
      throw error;
    }
  }

  /**
   * Update user streak
   */
  static async updateStreak(userId, streakValue) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (typeof streakValue !== 'number' || streakValue < 0) {
        throw new Error('Invalid streak value. Must be a non-negative number');
      }

      const { data: profile, error } = await supabaseAnon
        .from('profiles')
        .update({ 
          streak: streakValue,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Update streak error:', error);
        throw new Error(error.message);
      }

      return profile;
    } catch (error) {
      console.error('Update streak error:', error);
      throw error;
    }
  }

  /**
   * Increment user streak
   */
  static async incrementStreak(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Get current profile to get current streak
      const currentProfile = await this.getProfile(userId);
      const newStreak = (currentProfile.streak || 0) + 1;

      return await this.updateStreak(userId, newStreak);
    } catch (error) {
      console.error('Increment streak error:', error);
      throw error;
    }
  }

  /**
   * Reset user streak
   */
  static async resetStreak(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      return await this.updateStreak(userId, 0);
    } catch (error) {
      console.error('Reset streak error:', error);
      throw error;
    }
  }

  /**
   * Get all profiles (admin function)
   */
  static async getAllProfiles(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = supabaseAnon
        .from('profiles')
        .select('id, name, email, phone, streak, avatar_url, created_at, updated_at', { count: 'exact' });

      // Apply filters
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }

      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }

      if (filters.phone) {
        const cleanPhone = filters.phone.replace(/[^0-9]/g, '');
        if (cleanPhone) {
          query = query.eq('phone', parseInt(cleanPhone));
        }
      }

      if (filters.minStreak !== undefined) {
        query = query.gte('streak', parseInt(filters.minStreak));
      }

      // Apply pagination and sorting
      query = query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      const { data: profiles, error, count } = await query;

      if (error) {
        console.error('Error fetching all profiles:', error);
        throw new Error(error.message);
      }

      return {
        profiles: profiles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
          hasNextPage: offset + limit < count,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      console.error('Get all profiles error:', error);
      throw error;
    }
  }

  /**
   * Get profile statistics
   */
  static async getProfileStats() {
    try {
      // Get total profiles count
      const { count: totalProfiles, error: totalError } = await supabaseAnon
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Get profiles created in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentProfiles, error: recentError } = await supabaseAnon
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentError) throw recentError;

      // Get profiles with high streaks (> 7 days)
      const { count: activeProfiles, error: activeError } = await supabaseAnon
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('streak', 7);

      if (activeError) throw activeError;

      // Get profiles with email
      const { count: profilesWithEmail, error: emailError } = await supabaseAnon
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('email', 'is', null);

      if (emailError) throw emailError;

      // Get average streak
      const { data: avgData, error: avgError } = await supabaseAnon
        .from('profiles')
        .select('streak');

      if (avgError) throw avgError;

      const averageStreak = avgData.length > 0 
        ? avgData.reduce((sum, p) => sum + (p.streak || 0), 0) / avgData.length 
        : 0;

      return {
        total_profiles: totalProfiles,
        recent_profiles: recentProfiles,
        active_profiles: activeProfiles,
        profiles_with_email: profilesWithEmail,
        average_streak: Math.round(averageStreak * 100) / 100,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Get profile stats error:', error);
      throw error;
    }
  }

  /**
   * Search profiles by name or email
   */
  static async searchProfiles(searchTerm, pagination = {}) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('Search term must be at least 2 characters');
      }

      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const { data: profiles, error, count } = await supabaseAnon
        .from('profiles')
        .select('id, name, email, phone, streak, avatar_url, created_at', { count: 'exact' })
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .range(offset, offset + limit - 1)
        .order('name', { ascending: true });

      if (error) {
        console.error('Search profiles error:', error);
        throw new Error(error.message);
      }

      return {
        profiles: profiles,
        searchTerm: searchTerm,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
          hasNextPage: offset + limit < count,
          hasPreviousPage: page > 1
        }
      };
    } catch (error) {
      console.error('Search profiles error:', error);
      throw error;
    }
  }

  /**
   * Update avatar URL
   */
  static async updateAvatar(userId, avatarUrl) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!avatarUrl) {
        throw new Error('Avatar URL is required');
      }

      const urlValidation = this.validateURL(avatarUrl);
      if (!urlValidation.isValid) {
        throw new Error(urlValidation.message);
      }

      return await this.updateProfile(userId, { avatar_url: avatarUrl });
    } catch (error) {
      console.error('Update avatar error:', error);
      throw error;
    }
  }

  /**
   * Check if profile exists
   */
  static async profileExists(userId) {
    try {
      if (!userId) {
        return false;
      }

      const { data: profile, error } = await supabaseAnon
        .from('profiles')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        return false;
      }

      if (error) {
        throw error;
      }

      return !!profile;
    } catch (error) {
      console.error('Check profile exists error:', error);
      throw error;
    }
  }
}

module.exports = ProfileService;