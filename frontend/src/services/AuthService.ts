import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

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

class AuthService {
  
  // Move this method inside the class properly
  getStoredOTP(mobile: string): string | null {
    const stored = otpStorage.get(mobile);
    if (!stored || Date.now() > stored.expires) {
      return null;
    }
    return stored.otp;
  }

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

  // SMS OTP logic - Fixed
  async sendSMSOTP(phoneNumber: string): Promise<SMSResponse> {
    try {
      // Validate phone number format
      if (!phoneNumber || phoneNumber.length < 10) {
        return { success: false, error: 'Invalid phone number' };
      }

      // Clean up expired OTPs first
      this.cleanupExpiredOTPs();

      // Generate and store OTP
      const otp = this.generateOTP();
      const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
      
      otpStorage.set(phoneNumber, { otp, expires, attempts: 0 });
      
      console.log(`Demo OTP for ${phoneNumber}: ${otp}`); // For testing
      
      return {
        success: true,
        message: `OTP sent to ${phoneNumber}`,
      };
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  }

  async verifySMSOTP(phoneNumber: string, otp: string): Promise<OTPVerificationResult> {
    try {
      const stored = otpStorage.get(phoneNumber);
      
      if (!stored) {
        return { success: false, error: 'OTP not found. Please request a new one.' };
      }

      if (Date.now() > stored.expires) {
        otpStorage.delete(phoneNumber);
        return { success: false, error: 'OTP expired. Please request a new one.' };
      }

      if (stored.attempts >= 3) {
        otpStorage.delete(phoneNumber);
        return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
      }

      if (stored.otp !== otp.trim()) {
        stored.attempts++;
        otpStorage.set(phoneNumber, stored); // Update attempts
        return { 
          success: false, 
          error: `Invalid OTP. ${3 - stored.attempts} attempts remaining.` 
        };
      }

      // Success - clean up
      otpStorage.delete(phoneNumber);
      
      return {
        success: true,
        user: {
          id: `user_${Date.now()}`,
          name: 'KartikM',
          mobile: phoneNumber,
          isAuthenticated: true,
          avatar: '👤',
        },
      };
    } catch (error) {
      return { success: false, error: 'OTP verification failed' };
    }
  }

  // Helper method to generate OTP
  private generateOTP(): string {
    // Generate random 6-digit OTP for production
    // return Math.floor(100000 + Math.random() * 900000).toString();
    return "123456"
  }

  // Helper method to clean expired OTPs
  private cleanupExpiredOTPs(): void {
    const now = Date.now();
    for (const [phone, data] of otpStorage.entries()) {
      if (now > data.expires) {
        otpStorage.delete(phone);
      }
    }
  }

  // Method to clear all OTPs (useful for testing)
  clearAllOTPs(): void {
    otpStorage.clear();
  }
}

export const authService = new AuthService();
