import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Platform, StatusBar, ScrollView, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { authService } from '../../services/AuthService';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../../store/slices/authSlice';
import { setUser } from '../../store/slices/userSlice'; // Add this import
import { setSession } from '../../store/slices/authSlice'; // Add this import
import { SafeAreaView } from 'react-native-safe-area-context';

type OTPVerificationRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;
type OTPVerificationNavigationProp = StackNavigationProp<AuthStackParamList, 'OTPVerification'>;

export function OTPVerification() {
  const route = useRoute<OTPVerificationRouteProp>();
  const navigation = useNavigation<OTPVerificationNavigationProp>();
  const dispatch = useDispatch();
  
  const { mobile: routeMobile, name } = route.params;

  const [mobile, setMobile] = useState(routeMobile || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);
  const timerRef = useRef<number | null>(null);

  // Handle keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

// In your existing OTPVerification.tsx file, update the handleVerify function:
const handleVerify = async () => {
  const otpString = otp.join('');
  if (otpString.length !== 6) return;

  Keyboard.dismiss();
  setLoading(true);
  setError('');

  try {
    const { success, user, error, session, isLogin } = await authService.verifyOTP(mobile, otpString);
    if (!success) throw new Error(error);
    console.log('Verified user:', session);

    // Add user data to Redux store
    dispatch(setUser({
      id: user?.id || '',
      name: user?.name || '',
      mobile: user?.phone || '',
      email: user?.email || '',
      isAuthenticated: isLogin,
      session: session,
    }));

    setIsSuccess(true);

    // Navigate to home or onboarding
  navigation.navigate('UserOnboarding', {
          userId: user.id,
          mobile: mobile,
        })
  } catch (err) {
    setError('Invalid OTP. Please try again.');
  }

  setLoading(false);
};

  const handleOTPChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.join('').length === 6) {
      setTimeout(() => handleVerify(), 100);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setError('');
    setCanResend(false);
    setResendTimer(30);
    try {
      await authService.sendOTP(mobile);
    } catch (err) {
      setError('Failed to resend OTP');
      setCanResend(true);
    }
  };

  useEffect(() => {
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

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const formatMobile = (mobile: string) => {
    return mobile.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 *****');
  };


  return (
        <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify OTP</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          keyboardVisible && styles.scrollContentKeyboard
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Logo and instruction */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={[Colors.light.primary + '20', Colors.light.primary + '10']}
            style={styles.logoBox}
          >
            <Ionicons name="mail" size={32} color={Colors.light.primary} />
          </LinearGradient>
          <Text style={styles.verifyTitle}>Enter verification code</Text>
          <Text style={styles.verifySubtitle}>
            We've sent a 6-digit code to{'\n'}
            <Text style={styles.mobileText}>{formatMobile(mobile)}</Text>
          </Text>
        </View>

        {/* Error Display */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={Colors.light.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* OTP Input */}
        <View style={styles.otpSection}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOTPChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                editable={!loading}
                textAlign="center"
                autoFocus={index === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.resendSection}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
            )}
          </View>
        </View>

        {/* Change number option */}
        <TouchableOpacity 
          style={styles.changeNumberButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="pencil" size={14} color={Colors.light.primary} />
          <Text style={styles.changeNumberText}>Change mobile number</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Verify Button - Always visible */}
      <View style={[
        styles.bottomSection,
        keyboardVisible && styles.bottomSectionKeyboard
      ]}>
        <TouchableOpacity
          style={[
            styles.verifyButton,
            (otp.join('').length !== 6 || loading) && styles.verifyButtonDisabled
          ]}
          disabled={otp.join('').length !== 6 || loading}
          onPress={handleVerify}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={
              otp.join('').length === 6 && !loading
                ? [Colors.light.primary, '#1D4ED8']
                : [Colors.light.muted, Colors.light.muted]
            }
            style={styles.buttonGradient}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.light.primaryForeground} />
              ) : (
                <>
                  <Text style={[
                    styles.verifyButtonText,
                    (otp.join('').length !== 6 || loading) && styles.verifyButtonTextDisabled
                  ]}>
                    Verify OTP
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={16} 
                    color={otp.join('').length === 6 ? Colors.light.primaryForeground : Colors.light.mutedForeground} 
                  />
                </>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.foreground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Space for button
  },
  scrollContentKeyboard: {
    paddingBottom: 20, // Less space when keyboard is visible
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  verifyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    color: Colors.light.foreground,
    textAlign: 'center',
  },
  verifySubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
  mobileText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.error + '10',
    borderColor: Colors.light.error + '30',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  otpSection: {
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.light.input,
    borderWidth: 2,
    borderColor: Colors.light.border,
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.foreground,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  otpInputError: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.error + '10',
  },
  resendSection: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    color: Colors.light.mutedForeground,
    marginBottom: 6,
  },
  resendButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendLink: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  resendTimer: {
    fontSize: 13,
    color: Colors.light.mutedForeground,
    fontWeight: '500',
  },
  changeNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  changeNumberText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border + '30',
  },
  bottomSectionKeyboard: {
    position: 'relative',
    paddingBottom: Platform.OS === 'ios' ? 20 : 40,
  },
  verifyButton: {
    borderRadius: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: Colors.light.primaryForeground,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  verifyButtonTextDisabled: {
    color: Colors.light.mutedForeground,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: Colors.light.background,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.success,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
});