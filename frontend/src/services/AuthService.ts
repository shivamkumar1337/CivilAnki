import { Platform } from 'react-native';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

export interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface OTPVerificationResult {
  token?: string;
  success: boolean;
  user?: {
    id: string;
    name: string;
    mobile: string;
    isAuthenticated: boolean;
    avatar?: string;
  };
  error?: string;
}

class AuthService {

  async sendOTP(phone: string) {
    try {
      const res = await axios.post(`${API_BASE}/auth/otp`, { phone });
      return res.data; // { success: boolean, ... }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async verifyOTP(phone: string, token: string) {
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-otp`, {
        phone,
        token
      });
      return res.data; // { success: boolean, ... }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const authService = new AuthService();