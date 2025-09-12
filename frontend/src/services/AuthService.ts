// services/AuthService.ts
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface SocialLoginResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    provider: 'google' | 'apple';
  };
  error?: string;
}

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

class AuthService {  
  // Check if user exists in profiles table by mobile number
  async checkUserExists(mobile: string) {
    try {
      console.log("checkUserExists called with mobile:", mobile);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, goal, target_year, onboarding_completed, mobile, auth_user_id')
        .eq('mobile', mobile)
        .single();
      
      console.log("User check response:", data);
      return { data, error: error?.message };
    } catch (err) {
      console.log("User doesn't exist or error:", err);
      return { data: null, error: null }; // User doesn't exist
    }
  }

  async sendOTP(phone: string) {
    try {
      console.log("sendOTP called with phone:", phone);
      const { data, error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async verifyOTP(phone: string, otp: string) {
    try {
      console.log("verifyOTP called with phone:", phone, "otp:", otp);
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });
      if (error) throw error;
      return { 
        success: true, 
        data 
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // async signupProfile(userId: string, mobile: string, name?: string) {
  //   try {
  //     console.log("signupProfile called with userId:", userId, "mobile:", mobile, "name:", name);
      
  //     const profileData: any = {
  //       auth_user_id: userId,
  //       mobile: mobile,
  //       created_at: new Date().toISOString(),
  //     };
      
  //     // Only add name if it's provided and not empty
  //     if (name && name.trim()) {
  //       profileData.name = name.trim();
  //     }

  //     const { data, error } = await supabase
  //       .from('profiles')
  //       .insert(profileData)
  //       .select()
  //       .single();

  //     console.log("Profile insert response:", data);
  //     console.log("Any error:", error);

  //     return { data, error: error?.message };
  //   } catch (err: any) {
  //     console.log("Error in signupProfile:", err);
  //     return { 
  //       data: null, 
  //       error: err instanceof Error ? err.message : 'Failed to create profile' 
  //     };
  //   }
  // }

  // Update user profile with onboarding data
  async updateUserProfile(userId: string, profileData: any) {
    try {
      console.log("updateUserProfile called with userId:", userId, "profileData:", profileData);
      
      const updateData = {
        ...profileData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('auth_user_id', userId)
        .select()
        .single();
      
      console.log("Profile update response:", data);
      console.log("Any error:", error);

      return { data, error: error?.message };
    } catch (err: any) {
      console.log("Error in updateUserProfile:", err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to update profile' 
      };
    }
  }

  // Get user profile by auth user ID
  async getUserProfile(userId: string) {
    try {
      console.log("getUserProfile called with userId:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();
      
      console.log("Get profile response:", data);
      console.log("Any error:", error);

      return { data, error: error?.message };
    } catch (err: any) {
      console.log("Error in getUserProfile:", err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to get profile' 
      };
    }
  }

  // Get current authenticated user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  //create new user
  async createProfile(profile: {
  id: string;
  name: string;
  goal: string;
  target_year: number;
  mobile: string;
  email?: string;
}) {
  const res = await axios.post(`${API_BASE}/profiles`, profile);
  return res.data;
}

  // Social login methods (keeping your existing structure)
  async loginWithGoogle(): Promise<SocialLoginResult> {
    // Your existing Google login implementation
    try {
      // Implementation here
      return { success: false, error: "Not implemented yet" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async loginWithApple(): Promise<SocialLoginResult> {
    // Your existing Apple login implementation
    try {
      // Implementation here
      return { success: false, error: "Not implemented yet" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const authService = new AuthService();
