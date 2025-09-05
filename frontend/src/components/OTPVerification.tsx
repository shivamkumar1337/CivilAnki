import React, { useState, useEffect, useRef } from 'react';
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
  mobile: mobileProp,
  isLogin,
  onVerify,
  onBack,
  onResendOTP,
  userName,
}: OTPVerificationProps) {
  const [mobile, setMobile] = useState(mobileProp || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'enterMobile' | 'enterOtp'>('enterMobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const timerRef = useRef<number | null>(null);

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    try {
      const { success, error } = await authService.sendOTP(mobile);
      if (!success) throw new Error(error);
      setStep('enterOtp');
      setCanResend(false);
      setResendTimer(30);
    } catch (err) {
      setError('Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      const { success, data, error } = await authService.verifyOTP(mobile, otp);
      if (!success) throw new Error(error);
      onVerify(data);
      setIsSuccess(true);
    } catch (err) {
      setError('Invalid OTP');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setError('');
    setCanResend(false);
    setResendTimer(30);
    try {
      await sendOTP(mobile);
      if (onResendOTP) {
        onResendOTP();
      }
    } catch (err) {
      setError('Failed to resend OTP');
      setCanResend(true);
    }
  };

  const handleOTPChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    setOtp(digits);
  };

  useEffect(() => {
    // manage resend timer when entering OTP step
    if (step === 'enterOtp') {
      setCanResend(false);
      setResendTimer(30);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [step]);

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
              editable={!loading}
              placeholder="______"
              textAlign="center"
              autoFocus
            />
          </View>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otp.length !== 6 || loading) && { opacity: 0.5 }
            ]}
            disabled={otp.length !== 6 || loading}
            onPress={handleVerify}
            activeOpacity={0.8}
          >
            {loading ? (
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

function sendOTP(mobile: string) {
  throw new Error('Function not implemented.');
}
