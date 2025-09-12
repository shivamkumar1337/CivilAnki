import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_BASE = 'http://localhost:8000'; // Change to your backend URL

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
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token:otp,
        type: 'sms'
      });
      if (error) throw error;
      return { 
        success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const authService = new AuthService();
