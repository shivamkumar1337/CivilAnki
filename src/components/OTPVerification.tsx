import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Colors } from '../constants/Colors';
import { authService } from '../services/AuthService';
import { TextInput } from 'react-native';
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
    setOtp(value);
    setError('');
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  const handleVerify = async (otpToVerify: string = otp) => {
    if (otpToVerify.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await authService.verifySMSOTP(
        mobile,
        otpToVerify
      );
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
          <Text style={{ fontSize: 32, color: Colors.light.success }}>✔️</Text>
        </View>
        <Text style={styles.successTitle}>
          {isLogin ? 'Welcome back!' : 'Account created successfully!'}
        </Text>
        <Text style={styles.successSubtitle}>
          {isLogin
            ? 'You have been logged in successfully'
            : 'Your account has been created and verified'}
        </Text>
        <ActivityIndicator size="small" color={Colors.light.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.light.foreground}
            />
            </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Enter OTP</Text>
          <Text style={styles.headerSubtitle}>Verify your mobile number</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Logo and instruction */}
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={{ fontSize: 32 }}>📱</Text>
          </View>
          <Text style={styles.verifyTitle}>Verify your number</Text>
          <Text style={styles.verifySubtitle}>We've sent a 6-digit code to</Text>
          <Text style={styles.mobileText}>{formatMobile(mobile)}</Text>
        </View>

        {/* OTP Input */}
        <Card style={styles.otpCard}>
          <View style={styles.otpSection}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <Text style={styles.otpLabel}>Enter the 6-digit code</Text>
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
              />
            </View>
            {isLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Verifying OTP...</Text>
              </View>
            )}
            {otp.length === 6 && !isLoading && (
              <Button title='Verify OTP' onPress={() => handleVerify()} style={styles.verifyButton}>
                
              </Button>
            )}
            {/* Resend OTP */}
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
        </Card>

        {/* Demo info */}
        <Card style={styles.demoCard}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.demoTitle}>Demo Mode</Text>
            <Text style={styles.demoSubtitle}>
              Use OTP: <Text style={styles.demoCode}>123456</Text> to verify
            </Text>
          </View>
        </Card>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <Text style={{ fontSize: 14 }}>💡</Text>
            </View>
            <View>
              <Text style={styles.tipTitle}>Check your messages</Text>
              <Text style={styles.tipSubtitle}>The OTP will arrive within 30 seconds</Text>
            </View>
          </View>
          <View style={styles.tipRow}>
            <View style={styles.tipIcon}>
              <Text style={{ fontSize: 14 }}>🔒</Text>
            </View>
            <View>
              <Text style={styles.tipTitle}>Keep your OTP secure</Text>
              <Text style={styles.tipSubtitle}>Never share your OTP with anyone</Text>
            </View>
          </View>
        </View>

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
    </View>
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
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.foreground,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.light.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.light.foreground,
  },
  verifySubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginBottom: 2,
  },
  mobileText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  otpCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: Colors.light.accent + '33',
    borderWidth: 0,
  },
  otpSection: {
    alignItems: 'center',
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
  otpLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.light.foreground,
  },
  otpInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 2,
    borderColor: Colors.light.primary,
    width: 180,
    textAlign: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  verifyButton: {
    marginTop: 8,
    width: '100%',
  },
  resendSection: {
    alignItems: 'center',
    marginTop: 12,
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
    marginBottom: 16,
    backgroundColor: Colors.light.accent + '33',
    borderWidth: 0,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.foreground,
    marginBottom: 2,
  },
  demoSubtitle: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  demoCode: {
    backgroundColor: Colors.light.muted,
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
    color: Colors.light.primary,
  },
  tipsSection: {
    marginBottom: 16,
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
    marginRight: 8,
    marginTop: 2,
  },
  tipTitle: {
    fontSize: 14,
    color: Colors.light.foreground,
  },
  tipSubtitle: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  changeNumberSection: {
    alignItems: 'center',
    marginBottom: 24,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.success + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.success,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    marginBottom: 16,
  },
});