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
getStoredOTP(mobile: string): string | null {
  const stored = otpStorage.get(mobile);
  return stored?.otp || null;
}
  // Google Sign-In using Expo Auth Session
  async signInWithGoogle(): Promise<SocialLoginResult> {
    try {
      const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: 'YOUR_EXPO_CLIENT_ID',
        iosClientId: 'YOUR_IOS_CLIENT_ID',
        androidClientId: 'YOUR_ANDROID_CLIENT_ID',
        webClientId: 'YOUR_WEB_CLIENT_ID',
      });

      const result = await promptAsync();

      if (result?.type === 'success' && result.authentication?.accessToken) {
        // Fetch user info from Google API
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/userinfo/v2/me',
          {
            headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
          }
        );
        const userData = await userInfoResponse.json();

        return {
          success: true,
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatar: userData.picture,
            provider: 'google',
          },
        };
      }
      return { success: false, error: 'Google Sign-In canceled' };
    } catch (error) {
      return { success: false, error: 'Google Sign-In failed' };
    }
  }

  // Apple Sign-In using Expo Apple Authentication
  async signInWithApple(): Promise<SocialLoginResult> {
    try {
      if (Platform.OS !== 'ios') {
        return { success: false, error: 'Apple Sign-In is only available on iOS' };
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
    } catch (error) {
      return { success: false, error: 'Apple Sign-In failed or canceled' };
    }
  }

  // Demo SMS OTP logic
  async sendSMSOTP(phoneNumber: string): Promise<SMSResponse> {
    // Demo mode: generate and store OTP
    const otp = this.generateOTP();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStorage.set(phoneNumber, { otp, expires, attempts: 0 });
    return {
      success: true,
      message: `OTP sent to ${phoneNumber}. Demo OTP: ${otp}`,
    };
  }

  async verifySMSOTP(phoneNumber: string, otp: string): Promise<OTPVerificationResult> {
    const stored = otpStorage.get(phoneNumber);
    if (!stored || Date.now() > stored.expires) {
      return { success: false, error: 'OTP expired or not found' };
    }
    if (stored.attempts >= 3) {
      otpStorage.delete(phoneNumber);
      return { success: false, error: 'Too many attempts' };
    }
    if (stored.otp !== otp) {
      stored.attempts++;
      return { success: false, error: `Invalid OTP. ${3 - stored.attempts} attempts left.` };
    }
    otpStorage.delete(phoneNumber);
    return {
      success: true,
      user: {
        id: `user_${Date.now()}`,
        name: 'User',
        mobile: phoneNumber,
        isAuthenticated: true,
        avatar: '👤',
      },
    };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const authService = new AuthService();