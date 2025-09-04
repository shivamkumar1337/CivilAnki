import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../constants/Colors';
import { authService } from '../services/AuthService';
import { Ionicons } from '@expo/vector-icons';

interface OTPVerificationProps {
  mobile: string;
  isLogin: boolean;
  onVerify: (userData: any) => void;
  onBack: () => void;
  onResendOTP: () => void;
  userName?: string;
}

export function OTPVerification({
  mobile,
  isLogin,
  onVerify,
  onBack,
  onResendOTP,
  userName,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOTPChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    setError('');
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await authService.verifySMSOTP(mobile, otp);
      if (result.success && result.user) {
        setIsSuccess(true);
        setTimeout(() => {
          onVerify(result.user);
        }, 1000);
      } else {
        setError(result.error || 'Invalid OTP. Please check and try again.');
        setOtp('');
      }
    } catch (error) {
      setError('Verification service unavailable. Please try again.');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      setError('');
      const result = await authService.sendSMSOTP(mobile);
      if (result.success) {
        onResendOTP();
        setResendTimer(30);
        setCanResend(false);
        setOtp('');
        const demoOTP = authService.getStoredOTP(mobile);
        if (demoOTP) {
          setError(`Demo mode: New OTP sent! Use: ${demoOTP}`);
          setTimeout(() => setError(''), 5000);
        }
      } else {
        setError(result.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      setError('SMS service unavailable. Please try again later.');
    }
  };

  const formatMobile = (mobile: string) => {
    const parts = mobile.split(' ');
    if (parts.length === 3) {
      return `${parts[0]} ${parts[1]} ${'*'.repeat(parts[2].length)}`;
    }
    return mobile;
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={48} color={Colors.light.success} />
        </View>
        <Text style={styles.successTitle}>
          {isLogin ? 'Welcome back!' : 'Account created!'}
        </Text>
        <Text style={styles.successSubtitle}>
          {isLogin
            ? 'You have been logged in successfully.'
            : 'Your account has been created and verified.'}
        </Text>
        <ActivityIndicator size="small" color={Colors.light.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify OTP</Text>
      </View>

      <View style={styles.content}>
        {/* Logo and instruction */}
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Ionicons name="phone-portrait-outline" size={40} color={Colors.light.primary} />
          </View>
          <Text style={styles.verifyTitle}>Enter 6-digit code</Text>
          <Text style={styles.verifySubtitle}>
            Sent to <Text style={styles.mobileText}>{formatMobile(mobile)}</Text>
          </Text>
        </View>

        {/* OTP Input Card */}
        <View style={styles.otpCard}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.otpInputRow}>
            <TextInput
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={handleOTPChange}
              editable={!isLoading}
              placeholder="______"
              textAlign="center"
              autoFocus
            />
          </View>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otp.length !== 6 || isLoading) && { opacity: 0.5 }
            ]}
            disabled={otp.length !== 6 || isLoading}
            onPress={handleVerify}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
          <View style={styles.resendSection}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>Resend OTP in {resendTimer}s</Text>
            )}
          </View>
        </View>

        {/* Demo info */}
        {/* <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>Demo Mode</Text>
          <Text style={styles.demoSubtitle}>
            Use OTP: <Text style={styles.demoCode}>123456</Text>
          </Text>
        </View> */}

        {/* Tips */}
        {/* <View style={styles.tipsSection}>
          <View style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <Text style={{ fontSize: 16 }}>💡</Text>
            </View>
            <View>
              <Text style={styles.tipTitle}>Check your messages</Text>
              <Text style={styles.tipSubtitle}>OTP arrives within 30 seconds</Text>
            </View>
          </View>
          <View style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <Text style={{ fontSize: 16 }}>🔒</Text>
            </View>
            <View>
              <Text style={styles.tipTitle}>Keep your OTP secure</Text>
              <Text style={styles.tipSubtitle}>Never share your OTP with anyone</Text>
            </View>
          </View>
        </View> */}

        {/* Change number option */}
        <View style={styles.changeNumberSection}>
          <Text style={styles.changeNumberText}>
            Wrong number?{' '}
            <Text style={styles.changeNumberLink} onPress={onBack}>
              Change mobile number
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 0.5,
    borderColor: Colors.light.border,
    elevation: 1,
  },
  backButton: {
    marginRight: 10,
    padding: 8,
    borderRadius: 16,
    // backgroundColor: Colors.light.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    // fontWeight: 'bold',
    color: Colors.light.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    // justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoBox: {
    width: 60,
    height: 60,
    // borderRadius: 18,
    // backgroundColor: Colors.light.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    // elevation: 2,
  },
  verifyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: Colors.light.foreground,
    textAlign: 'center',
  },
  verifySubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginBottom: 2,
    textAlign: 'center',
  },
  mobileText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  otpCard: {
    padding: 20,
    marginBottom: 14,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    elevation: 1,
    // // shadowColor: '#000',
    // shadowOpacity: 0.07,
    // shadowRadius: 8,
    // shadowOffset: { width: 0, height: 2 },
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  otpInput: {
    fontSize: 28,
    letterSpacing: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 2,
    borderColor: Colors.light.primary,
    width: 200,
    textAlign: 'center',
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 8,
  },
  verifyButton: {
    marginTop: 8,
    width: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  errorBox: {
    backgroundColor: Colors.light.error + '22',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    textAlign: 'center',
  },
  resendSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  resendText: {
    fontSize: 13,
    color: Colors.light.mutedForeground,
    marginBottom: 2,
  },
  resendLink: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  resendTimer: {
    fontSize: 13,
    color: Colors.light.mutedForeground,
    marginTop: 2,
  },
  demoCard: {
    padding: 12,
    marginBottom: 14,
    backgroundColor: Colors.light.accent + '33',
    borderRadius: 12,
    elevation: 1,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.light.foreground,
    marginBottom: 2,
    textAlign: 'center',
  },
  demoSubtitle: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
  },
  demoCode: {
    backgroundColor: Colors.light.muted,
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
    color: Colors.light.primary,
  },
  tipsSection: {
    marginBottom: 10,
    marginTop: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  tipTitle: {
    fontSize: 14,
    color: Colors.light.foreground,
    fontWeight: 'bold',
  },
  tipSubtitle: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  changeNumberSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  changeNumberText: {
    fontSize: 13,
    color: Colors.light.mutedForeground,
  },
  changeNumberLink: {
    color: Colors.light.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: Colors.light.background,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.success + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.success,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    marginBottom: 16,
  },
});