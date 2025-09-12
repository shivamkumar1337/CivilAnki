import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { authService } from '../../services/AuthService';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { SafeAreaView } from 'react-native-safe-area-context';

type MobileAuthProps = {
  onSubmit: (mobile: string, isValid: boolean) => {sendSMSOTP: any};
  onBack: () => void;
};

type AuthOptionsNavigationProp = StackNavigationProp<AuthStackParamList, 'AuthOptions'>;

export function MobileAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<AuthOptionsNavigationProp>();
  const dispatch = useDispatch();

  const handleSubmit = () => {
    navigation.navigate('OTPVerification', { 
      mobile: `+91${mobile}`, 
      isLogin: isLogin,
      name: name 
    });
  };

  const handleMobileChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setMobile(digits);
    validateForm(digits, name);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    validateForm(mobile, value);
  };

  const validateForm = (mobileValue: string, nameValue: string) => {
    const isMobileValid = mobileValue.length === 10 && ['6','7','8','9'].includes(mobileValue[0]);
    const isNameValid = isLogin || nameValue.trim().length >= 2;
    setIsValid(isMobileValid && isNameValid);
  };

  const handleContinue = async () => {
    if (!isValid || isLoading) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const result = await authService.sendOTP(`+91${mobile}`);
      
      if (result.success) {
        handleSubmit();
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setError('SMS service unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
    validateForm(mobile, '');
  };

  return (
      <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Toggle Section */}
          <View style={styles.toggleSection}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <LinearGradient
              colors={[Colors.light.primary + '20', Colors.light.primary + '10']}
              style={styles.logoBox}
            >
              <Ionicons name="phone-portrait" size={28} color={Colors.light.primary} />
            </LinearGradient>
            <Text style={styles.title}>Enter your mobile number</Text>
            <Text style={styles.subtitle}>We'll send you a verification code</Text>
          </View>

          {/* Error Display */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={Colors.light.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Input Section */}
          <View style={styles.inputSection}>
            {/* Name Input (only for signup) */}
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIconContainer}>
                    <Ionicons name="person" size={18} color={Colors.light.mutedForeground} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={handleNameChange}
                    placeholderTextColor={Colors.light.mutedForeground}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Mobile Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View style={styles.inputContainer}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCode}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.mobileInput]}
                  placeholder="Enter 10-digit number"
                  keyboardType="number-pad"
                  value={mobile}
                  onChangeText={handleMobileChange}
                  maxLength={10}
                  placeholderTextColor={Colors.light.mutedForeground}
                />
              </View>
            </View>
          </View>

          {/* Spacer to push button down */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Continue Button - Fixed at bottom */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.continueButton, !isValid && styles.continueButtonDisabled]}
            disabled={!isValid || isLoading}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isValid ? [Colors.light.primary, '#1D4ED8'] : [Colors.light.muted, Colors.light.muted]}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size={'small'} color={Colors.light.background}/>
                    {/* <Ionicons name="hourglass" size={18} color={Colors.light.primaryForeground} /> */}
                    {/* <Text style={styles.continueText}>Sending OTP...</Text> */}
                  </>
                ) : (
                  <>
                    <Text style={[styles.continueText, !isValid && styles.continueTextDisabled]}>
                      Continue
                    </Text>
                    <Ionicons 
                      name="arrow-forward" 
                      size={16} 
                      color={isValid ? Colors.light.primaryForeground : Colors.light.mutedForeground} 
                    />
                  </>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  toggleSection: {
    marginBottom: 32,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.secondary,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.mutedForeground,
  },
  toggleTextActive: {
    color: Colors.light.foreground,
    fontWeight: '600',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
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
  inputSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.input,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  inputIconContainer: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: Colors.light.secondary,
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
  },
  countryCodeContainer: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: Colors.light.secondary,
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.foreground,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 15,
    color: Colors.light.foreground,
    fontWeight: '500',
  },
  mobileInput: {
    letterSpacing: 1,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border + '30',
  },
  continueButton: {
    borderRadius: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonDisabled: {
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
  continueText: {
    color: Colors.light.primaryForeground,
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  continueTextDisabled: {
    color: Colors.light.mutedForeground,
  },
});