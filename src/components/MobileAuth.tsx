import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Colors } from '../constants/Colors';
import { authService } from '../services/AuthService';

interface MobileAuthProps {
  onSubmit: (mobile: string, isLogin: boolean, name?: string) => void;
  onBack: () => void;
}

export function MobileAuth({ onSubmit, onBack }: MobileAuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ mobile?: string; name?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const formatMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const cleaned = digits.slice(0, 10);
    if (cleaned.length <= 5) {
      return cleaned;
    }
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  };

  const validateMobile = (mobile: string) => {
    const digits = mobile.replace(/\D/g, '');
    if (!digits) return 'Mobile number is required';
    if (digits.length !== 10) return 'Please enter a valid 10-digit mobile number';
    if (!['6', '7', '8', '9'].includes(digits[0])) return 'Mobile number should start with 6, 7, 8, or 9';
    return null;
  };

  const validateName = (name: string) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return null;
  };

  const handleSubmit = async () => {
    const newErrors: { mobile?: string; name?: string } = {};
    const mobileError = validateMobile(mobile);
    if (mobileError) newErrors.mobile = mobileError;
    if (activeTab === 'signup') {
      const nameError = validateName(name);
      if (nameError) newErrors.name = nameError;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const formattedMobile = `+91 ${mobile}`;
      const smsResult = await authService.sendSMSOTP(formattedMobile);
      if (smsResult.success) {
        setErrors({ general: '' });
        const demoOTP = authService.getStoredOTP(formattedMobile);
        if (demoOTP) {
          setErrors({ general: `Demo mode: OTP sent! Use: ${demoOTP}` });
          setTimeout(() => {
            onSubmit(formattedMobile, activeTab === 'login', activeTab === 'signup' ? name : undefined);
          }, 2000);
        } else {
          onSubmit(formattedMobile, activeTab === 'login', activeTab === 'signup' ? name : undefined);
        }
      } else {
        setErrors({ general: smsResult.error || 'Failed to send OTP. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'SMS service unavailable. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileChange = (value: string) => {
    const formatted = formatMobileNumber(value);
    setMobile(formatted);
    if (errors.mobile) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.mobile;
        return newErrors;
      });
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <View style={styles.backIconBox}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Mobile Authentication</Text>
          <Text style={styles.headerSubtitle}>Enter your mobile number to continue</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={{ fontSize: 32 }}>📱</Text>
          </View>
          <Text style={styles.title}>{activeTab === 'login' ? 'Welcome back' : 'Create account'}</Text>
          <Text style={styles.subtitle}>
            {activeTab === 'login'
              ? 'Login to continue your UPSC preparation'
              : 'Join thousands of successful UPSC aspirants'}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'login' && styles.tabActive]}
            onPress={() => setActiveTab('login')}
          >
            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'signup' && styles.tabActive]}
            onPress={() => setActiveTab('signup')}
          >
            <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.formCard}>
          {/* General error/success */}
          {errors.general ? (
            <View style={[styles.alertBox, errors.general.includes('Demo mode:') ? styles.alertSuccess : styles.alertError]}>
              <Text style={errors.general.includes('Demo mode:') ? styles.alertSuccessText : styles.alertErrorText}>
                {errors.general}
              </Text>
            </View>
          ) : null}

          {/* Name field for signup */}
          {activeTab === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter your full name"
                value={name}
                onChangeText={handleNameChange}
                editable={!isLoading}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
          )}

          {/* Mobile number field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile number</Text>
            <View style={styles.mobileRow}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={[styles.input, styles.inputMobile, errors.mobile && styles.inputError]}
                placeholder="Enter mobile number"
                value={mobile}
                onChangeText={handleMobileChange}
                keyboardType="number-pad"
                maxLength={11}
                editable={!isLoading}
              />
            </View>
            {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
            <Text style={styles.inputHint}>We'll send you an OTP to verify your number</Text>
          </View>

          {/* Submit button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && { opacity: 0.6 }
            ]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.light.primary} />
            ) : (
              <Text style={styles.submitButtonText}>
                {`Send OTP${activeTab === 'signup' ? ' & Create Account' : ''}`}
              </Text>
            )}
          </TouchableOpacity>
        </Card>

        {/* Demo credentials */}
        <Card style={styles.demoCard}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.demoTitle}>Demo Instructions</Text>
            <Text style={styles.demoSubtitle}>Enter any valid 10-digit mobile number</Text>
            <Text style={styles.demoSubtitle}>
              Use OTP: <Text style={styles.demoCode}>123456</Text> for verification
            </Text>
          </View>
        </Card>

        {/* Additional info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Features reminder */}
        <Card style={styles.featureCard}>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Text style={{ fontSize: 16 }}>🔒</Text>
            </View>
            <View>
              <Text style={styles.featureTitle}>Secure & Fast</Text>
              <Text style={styles.featureSubtitle}>
                One-time password ensures secure access to your account
              </Text>
            </View>
          </View>
        </Card>
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
    padding: 8,
    borderRadius: 16,
    backgroundColor: Colors.light.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.light.primary,
    fontWeight: 'bold',
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
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.light.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginBottom: 2,
    textAlign: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    marginTop: 8,
    justifyContent: 'center',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  tabActive: {
    borderColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.light.mutedForeground,
  },
  tabTextActive: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  formCard: {
    padding: 20,
    marginBottom: 16,
    backgroundColor: Colors.light.accent + '33',
    borderWidth: 0,
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
  alertSuccess: {
    backgroundColor: Colors.light.success + '22',
  },
  alertErrorText: {
    color: Colors.light.error,
    fontSize: 14,
    textAlign: 'center',
  },
  alertSuccessText: {
    color: Colors.light.success,
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: Colors.light.foreground,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.foreground,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBox: {
    backgroundColor: Colors.light.muted,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRightWidth: 0,
  },
  countryCodeText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  inputMobile: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginLeft: -1,
    flex: 1,
  },
  inputHint: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    marginTop: 2,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 13,
    marginTop: 2,
  },
  submitButton: {
    marginTop: 8,
    width: '100%',
    height: 48,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  infoSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
  },
  linkText: {
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  featureCard: {
    padding: 12,
    backgroundColor: Colors.light.accent + '22',
    borderWidth: 0,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  featureTitle: {
    fontSize: 14,
    color: Colors.light.foreground,
  },
  featureSubtitle: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
});