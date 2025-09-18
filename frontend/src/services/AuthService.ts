import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_BASE = process.env.EXPO_PUBLIC_API_URL; // Change to your backend URL

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

// In-memory OTP storage (for demo)
const otpStorage = new Map<string, { otp: string; expires: number; attempts: number }>();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

class AuthService {
async updateProfile(updates: { 
  name: string;
  goal: string;
  target_year: number;
  status?: number;
  mobile?: string;
  email?: string;
}) {
  try {
    const res = await axios.post(`${API_BASE}/profile/updateprofile`, { updates});
    console.log("Profile update response:", res.data);
    return res.data; // Adjust based on your backend's response
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
  
  // Move this method inside the class properly
  // getStoredOTP(mobile: string): string | null {
  //   const stored = otpStorage.get(mobile);
  //   if (!stored || Date.now() > stored.expires) {
  //     return null;
  //   }
  //   return stored.otp;
  // }

  // Google Sign-In - Remove hook usage, make it configurable
  async signInWithGoogle(config: {
    clientId: string;
    iosClientId?: string;
    androidClientId?: string;
    webClientId?: string;
  }): Promise<SocialLoginResult> {
    try {
      // This should be handled in the component that calls this service
      // You'll need to pass the authentication result to this method
      throw new Error('Google Sign-In should be handled in React component with hooks');
    } catch (error) {
      return { success: false, error: 'Google Sign-In configuration error' };
    }
  }

  // Apple Sign-In
  async signInWithApple(): Promise<SocialLoginResult> {
    try {
      if (Platform.OS !== 'ios') {
        return { success: false, error: 'Apple Sign-In is only available on iOS' };
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return { success: false, error: 'Apple Sign-In is not available on this device' };
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      return {
        success: true,
        user: {
          id: credential.user,
          name: credential.fullName
            ? `${credential.fullName.givenName ?? ''} ${credential.fullName.familyName ?? ''}`.trim()
            : credential.email?.split('@')[0] ?? 'Apple User',
          email: credential.email ?? '',
          provider: 'apple',
        },
      };
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        return { success: false, error: 'Apple Sign-In canceled by user' };
      }
      return { success: false, error: 'Apple Sign-In failed' };
    }
  }


  //check user
async checkUserExists(mobile: string) {
    // Assumes backend expects ?phone=+91XXXXXXXXXX
    const res = await axios.post(`${API_BASE}/auth/check-user-exists`, 
 { credential: mobile, authType: "phone" }
    );
    console.log("checkUserExists response:", res.data);
    return res.data; // { exists: true/false, ... }
  }




  // Helper method to clean expired OTPs

  // // Method to clear all OTPs (useful for testing)
  // clearAllOTPs(): void {
  //   otpStorage.clear();
  // }

  // Send OTP via backend
  async sendOTP(phone: string) {
    try {
      const res = await axios.post(`${API_BASE}/auth/otp`, { phone });
      return res.data; // { success: boolean, ... }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Verify OTP via backend
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