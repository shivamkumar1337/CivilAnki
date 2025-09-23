import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { authService } from '../../services/AuthService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { SafeAreaView } from 'react-native-safe-area-context';

type MobileAuthNavigationProp = StackNavigationProp<AuthStackParamList, 'MobileAuth'>;

export function MobileAuth() {
  const [mobile, setMobile] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<MobileAuthNavigationProp>();

  useEffect(() => {
    validateForm(mobile);
  }, [mobile]);

  const handleMobileChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);    
    setMobile(digits);
    if (error) setError('');
  };

  const validateForm = (mobileValue: string) => {
    const isMobileValid = mobileValue.length === 10 && ['6','7','8','9'].includes(mobileValue[0]);

    if (!isMobileValid && mobileValue.length === 10) {
      setError('Please enter a valid 10-digit mobile number.');
    }
    setIsValid(isMobileValid);
    return isMobileValid;
  };

const handleContinue = async () => {
  try {
    setIsLoading(true);
    setError('');
    const fullMobile = `+91${mobile}`;

    // 1. Send OTP
    const result = await authService.sendOTP(fullMobile);
    // temp
    // result.success=true;
    if (result.success) {
 
        navigation.navigate('OTPVerification', { 
          mobile: fullMobile, 
          isLogin: false,
          name: undefined,
        });
      
    } else {
      setError(result.error || 'Failed to send OTP. Please try again.');
    }
  } catch (error: any) {
    setError('Error: ' + (error || 'Something went wrong. Please try again.'));
  } finally {
    setIsLoading(false);
  }
};

  // Debug: Log button state
  const buttonDisabled = !isValid || isLoading;
  // console.log('Button state:', { isValid, isLoading, buttonDisabled });

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter your mobile number</Text>
        <View style={{ width: 40 }} />
      </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
{/* 
          <View style={styles.logoSection}>
            <Text style={styles.title}>Enter your mobile number</Text>
          </View> */}

          {/* Error Display */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={Colors.light.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Mobile Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputGroup}>
              {/* <Text style={styles.inputLabel}>Mobile Number</Text> */}
              <View style={[
                styles.inputContainer,
                isValid && styles.inputContainerValid
              ]}>
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
                  editable={!isLoading}
                  autoFocus
                />
                {isValid && (
                  <View style={styles.validIcon}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.light.success} />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Spacer to push button down */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Continue Button - Fixed at bottom */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.continueButton, 
              buttonDisabled && styles.continueButtonDisabled
            ]}
            disabled={buttonDisabled}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isValid && !isLoading ? [Colors.light.primary, '#1D4ED8'] : [Colors.light.muted, Colors.light.muted]}
              style={styles.buttonGradient}
            >
              <View style={styles.buttonContent}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size={'small'} color={Colors.light.background}/>
                    <Text style={styles.loadingText}>Sending OTP...</Text>
                  </>
                ) : (
                  <>
                    <Text style={[
                      styles.continueText, 
                      buttonDisabled && styles.continueTextDisabled
                    ]}>
                      Login / Sign Up
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
          <Text style={styles.privacyText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  // Debug styles - Remove in production
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 50,
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
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
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
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
    marginBottom: 32,
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
  inputContainerValid: {
    borderColor: Colors.light.success,
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
  validIcon: {
    paddingRight: 12,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 12,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    flex: 1,
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
    marginBottom: 16,
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
  loadingText: {
    color: Colors.light.primaryForeground,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  privacyText: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    lineHeight: 16,
  },
  linkText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
