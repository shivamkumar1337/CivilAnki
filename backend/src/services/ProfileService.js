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
   * Update user profile
   */
  static async updateProfile(userId, updates) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Remove fields that shouldn't be updated
      const sanitizedUpdates = { ...updates };
      delete sanitizedUpdates.id;
      delete sanitizedUpdates.auth_user_id;
      delete sanitizedUpdates.created_at;

      if (Object.keys(sanitizedUpdates).length === 0) {
        throw new Error('No valid fields to update');
      }

      // Validate name if provided
      if (sanitizedUpdates.name !== undefined) {
        if (sanitizedUpdates.name === null || sanitizedUpdates.name === '') {
          throw new Error('Name cannot be empty');
        }
        const nameValidation = this.validateName(sanitizedUpdates.name);
        if (!nameValidation.isValid) {
          throw new Error(nameValidation.message);
        }
        sanitizedUpdates.name = nameValidation.cleaned;
      }

      // Validate email if provided
      if (sanitizedUpdates.email !== undefined) {
        if (sanitizedUpdates.email === null || sanitizedUpdates.email === '') {
          sanitizedUpdates.email = null; // Allow clearing email
        } else {
          const emailValidation = this.validateEmail(sanitizedUpdates.email);
          if (!emailValidation.isValid) {
            throw new Error(emailValidation.message);
          }
          sanitizedUpdates.email = sanitizedUpdates.email.toLowerCase().trim();
        }
      }

      // // Validate phone if provided
      // if (sanitizedUpdates.phone !== undefined) {
      //   if (sanitizedUpdates.phone === null || sanitizedUpdates.phone === '') {
      //     sanitizedUpdates.phone = null; // Allow clearing phone
      //   } else {
      //     const phoneValidation = this.validateIndianPhone(sanitizedUpdates.phone);
      //     if (!phoneValidation.isValid) {
      //       throw new Error(phoneValidation.message);
      //     }
      //     // Convert to numeric format for database
      //     sanitizedUpdates.phone = parseInt(phoneValidation.formatted.replace('+91', ''));
      //   }
      // }

      // Validate avatar URL if provided
      if (sanitizedUpdates.avatar_url !== undefined) {
        if (sanitizedUpdates.avatar_url === null || sanitizedUpdates.avatar_url === '') {
          sanitizedUpdates.avatar_url = null; // Allow clearing avatar
        } else {
          const urlValidation = this.validateURL(sanitizedUpdates.avatar_url);
          if (!urlValidation.isValid) {
            throw new Error(urlValidation.message);
          }
        }
      }

      // Validate streak if provided
      if (sanitizedUpdates.streak !== undefined) {
        if (typeof sanitizedUpdates.streak !== 'number' || sanitizedUpdates.streak < 0) {
          throw new Error('Streak must be a non-negative number');
        }
      }

      // Add updated timestamp
      // sanitizedUpdates.updated_at = new Date().toISOString();

      // Update profile
      const { data: profile, error } = await supabaseAnon
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('auth_user_id', userId)
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
   * Create new profile
   */
  static async createProfile(userId, profileData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!profileData.name) {
        throw new Error('Name is required');
      }

      // Validate name
      const nameValidation = this.validateName(profileData.name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
      }

      // Validate email if provided
      if (profileData.email) {
        const emailValidation = this.validateEmail(profileData.email);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.message);
        }
      }

      // Validate phone if provided
      let phoneNumeric = null;
      if (profileData.phone) {
        const phoneValidation = this.validateIndianPhone(profileData.phone);
        if (!phoneValidation.isValid) {
          throw new Error(phoneValidation.message);
        }
        phoneNumeric = parseInt(phoneValidation.formatted.replace('+91', ''));
      }

      // Validate avatar URL if provided
      if (profileData.avatar_url) {
        const urlValidation = this.validateURL(profileData.avatar_url);
        if (!urlValidation.isValid) {
          throw new Error(urlValidation.message);
        }
      }

      // Create profile
      const newProfile = {
        auth_user_id: userId,
        name: nameValidation.cleaned,
        email: profileData.email ? profileData.email.toLowerCase().trim() : null,
        phone: phoneNumeric,
        streak: 0,
        avatar_url: profileData.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: profile, error } = await supabaseAnon
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error('Create profile error:', error);
        throw new Error(error.message);
      }

      return profile;
    } catch (error) {
      console.error('Create profile error:', error);
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