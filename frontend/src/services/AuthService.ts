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
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  async signupProfile(userId: string, name: string) {
    console.log("signupProfile called with userId:", userId, "name:", name);
const { data, error } = await supabase
  .from('profiles')
  .insert({ name, auth_user_id: userId })
  .select();  // ← Add this to return the inserted data

console.log("Profile insert response:", data);
console.log("Any error:", error);

    return { data };
  }


}




export const authService = new AuthService();
