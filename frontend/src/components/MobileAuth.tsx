import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/AuthService';

type MobileAuthProps = {
  onSubmit: (mobile: string, isValid: boolean) => {sendSMSOTP: any};
  onBack: () => void;
};

export function MobileAuth({ onSubmit, onBack }:MobileAuthProps) {
  const [mobile, setMobile] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handleMobileChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setMobile(digits);
    setIsValid(digits.length === 10 && ['6','7','8','9'].includes(digits[0]));
  };

   const handleContinue = async () => {
    if (!isValid || isLoading) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Send OTP using the auth service
      const result = await authService.sendSMSOTP(`+91${mobile}`);
      
      if (result.success) {
        // Get the demo OTP for display (remove this in production)
        const demoOTP = authService.getStoredOTP(`+91${mobile}`);
        
        if (demoOTP) {
          // Show demo OTP temporarily (remove this in production)
          setError(`Demo mode: OTP sent! Use: ${demoOTP}`);
          setTimeout(() => setError(''), 5000);
        }
        
        // Call onSubmit with the mobile number and success status
        onSubmit(`+91${mobile}`, true);
      } else {
        setError(result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setError('SMS service unavailable. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header, Logo, Input */}
      <View style={{ flex: 1 }}>
        {/* Header */}
             <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Welcome</Text>
      </View>

        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logo}>🎯</Text>
        </View>

        {/* Mobile Input */}
        <View style={styles.inputSection}>
          <Text style={styles.title}>Enter your mobile number</Text>
          <View style={styles.mobileRow}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              keyboardType="number-pad"
              value={mobile}
              onChangeText={handleMobileChange}
              maxLength={10}
            />
          </View>
          <Text style={styles.hint}>We'll send you an OTP to verify your number</Text>
        </View>
      </View>

      {/* Continue Button at bottom */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isValid && { opacity: 0.5 }
          ]}
          disabled={!isValid}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'flex-start',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  logoBox: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  logo: {
    fontSize: 40,
  },
  inputSection: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  countryCode: {
    fontSize: 16,
    color: Colors.light.mutedForeground,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    color: Colors.light.foreground,
    textAlign: 'center',
    minWidth: 160,
  },
  hint: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    marginTop: 8,
  },
  bottom: {
    alignItems: 'center',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});