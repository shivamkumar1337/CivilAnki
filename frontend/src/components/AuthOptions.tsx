import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { Colors } from '../constants/Colors';
import { authService, SocialLoginResult } from '../services/AuthService';

interface AuthOptionsProps {
  onMobileAuth: () => void;
  onSocialLogin: (provider: 'google' | 'apple', userData: any) => void;
}

export function AuthOptions({ onMobileAuth, onSocialLogin }: AuthOptionsProps) {
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [error, setError] = useState<string>('');

  // Handle social login
  // const handleSocialLogin = async (provider: 'google' | 'apple') => {
  //   setSocialLoading(provider);
  //   setError('');
  //   try {
  //     let result: SocialLoginResult;
  //     if (provider === 'google') {
  //       result = await authService.signInWithGoogle();
      
  //     if (result.success && result.user) {
  //       onSocialLogin(provider, result.user);
  //     } else {
  //       setError(result.error || `${provider} sign-in failed`);
  //     }
  //   }
  //   } catch (error) {
  //     setError(`${provider} sign-in is temporarily unavailable`);
  //   } finally {
  //     setSocialLoading(null);
  //   }
  // };

  return (
    <View style={styles.container}>
      {/* Header with branding */}
      <View style={styles.headerSection}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>🎯</Text>
        </View>
        <Text style={styles.headerTitle}>Welcome to CivilAnki</Text>
        <Text style={styles.headerSubtitle}>Your UPSC preparation companion</Text>
        {/* <Card style={styles.featuresCard}>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}><Text style={styles.featureIconText}>📚</Text></View>
            <View>
              <Text style={styles.featureTitle}>Spaced Repetition Learning</Text>
              <Text style={styles.featureSubtitle}>Review at optimal intervals</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}><Text style={styles.featureIconText}>📊</Text></View>
            <View>
              <Text style={styles.featureTitle}>Progress Tracking</Text>
              <Text style={styles.featureSubtitle}>Monitor your improvement</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}><Text style={styles.featureIconText}>🎯</Text></View>
            <View>
              <Text style={styles.featureTitle}>Previous Year Questions</Text>
              <Text style={styles.featureSubtitle}>1980-2025 comprehensive database</Text>
            </View>
          </View>
        </Card> */}
        <View style={styles.socialProofSection}>
          <Text style={styles.socialProofText}>Trusted by thousands of UPSC aspirants</Text>
          <View style={styles.socialProofRow}>
            <Text style={styles.socialProofSmall}>⭐ 4.8/5 Rating</Text>
            {/* <Text style={styles.socialProofSmall}>•</Text> */}
            {/* <Text style={styles.socialProofSmall}>📱 Quick Mobile Login</Text> */}
          </View>
        </View>
      </View>

      {/* Authentication options */}
      <View style={styles.authSection}>
        {/* Error display */}
        {error ? (
          <View style={[styles.alertBox, styles.alertError]}>
            <Text style={styles.alertErrorText}>{error}</Text>
          </View>
        ) : null}

        {/* Primary: Mobile number authentication */}
        <TouchableOpacity
          style={styles.mobileButton}
          onPress={onMobileAuth}
          activeOpacity={0.8}
        >
          <View style={styles.mobileIconBox}>
            <Text style={styles.mobileIcon}>📱</Text>
          </View>
          <Text style={styles.mobileButtonText}>Continue with Mobile Number</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.divider} />
        </View>

        {/* Continue with Google */}
        {/* <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('google')}
          activeOpacity={0.8}
          disabled={socialLoading !== null}
        >
          {socialLoading === 'google' ? (
            <>
              <ActivityIndicator size="small" color="#EA4335" style={{ marginRight: 10 }} />
              <Text style={styles.socialButtonText}>Signing in...</Text>
            </>
          ) : (
            <>
              <View style={styles.socialIconGoogle}>
                <Text style={styles.socialIconText}>G</Text>
              </View>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity> */}
        {/* Continue with Apple */}
        {/* <TouchableOpacityr
          style={styles.socialButton}
          onPress={() => handleSocialLogin('apple')}
          activeOpacity={0.8}
          disabled={socialLoading !== null}
        >
          {socialLoading === 'apple' ? (
            <>
              <ActivityIndicator size="small" color="#000" style={{ marginRight: 10 }} />
              <Text style={styles.socialButtonText}>Signing in...</Text>
            </>
          ) : (
            <>
              <View style={styles.socialIconApple}>
                <Text style={styles.socialIconText}>🍎</Text>
              </View>
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </>
          )}
        </TouchableOpacity> */}

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
          {/* <Text style={styles.termsSmall}>
            Mobile number login provides the fastest and most secure access to your account
          </Text> */}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingVertical: 30,
  },
  headerSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    alignSelf: 'center',
  },
  logoIcon: {
    fontSize: 36,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: Colors.light.foreground,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresCard: {
    padding: 18,
    marginBottom: 18,
    backgroundColor: Colors.light.accent + '33',
    borderWidth: 0,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  featureIconText: {
    fontSize: 16,
  },
  featureTitle: {
    fontSize: 14,
    color: Colors.light.foreground,
  },
  featureSubtitle: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  socialProofSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  socialProofText: {
    fontSize: 13,
    color: Colors.light.mutedForeground,
    marginBottom: 2,
  },
  socialProofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  socialProofSmall: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  authSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  alertBox: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  alertError: {
    backgroundColor: Colors.light.error + '22',
  },
  alertErrorText: {
    color: Colors.light.error,
    fontSize: 14,
    textAlign: 'center',
  },
  mobileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    justifyContent: 'center',
  },
  mobileIconBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + '44',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  mobileIcon: {
    fontSize: 16,
    color: Colors.light.foreground,
  },
  mobileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: Colors.light.mutedForeground,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    justifyContent: 'center',
  },
  socialIconGoogle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  socialIconApple: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  socialIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  socialButtonText: {
    fontSize: 15,
    color: Colors.light.foreground,
    fontWeight: '500',
  },
  termsSection: {
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  termsText: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
  },
  linkText: {
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  termsSmall: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    marginTop: 4,
  },
});