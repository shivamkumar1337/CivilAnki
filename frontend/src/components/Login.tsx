import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { Card } from './ui/Card';
import { Colors } from '../constants/Colors';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onBack: () => void;
  onSignup: () => void;
}

export function Login({ onLogin, onBack, onSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (password === 'password') {
        onLogin(email, password);
      } else {
        setErrors({ general: 'Invalid email or password. Try password: "password"' });
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
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
          <Text style={styles.headerTitle}>Log in</Text>
          <Text style={styles.headerSubtitle}>Welcome back to CivilAnki</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={{ fontSize: 28 }}>🎯</Text>
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Continue your UPSC preparation journey</Text>
        </View>

        {/* Form */}
        <Card style={styles.formCard}>
          {errors.general ? (
            <View style={[styles.alertBox, styles.alertError]}>
              <Text style={styles.alertErrorText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* Email field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, errors.password && styles.inputError, { flex: 1 }]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Forgot password */}
          <View style={styles.forgotRow}>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
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
              <Text style={styles.submitButtonText}>Log in</Text>
            )}
          </TouchableOpacity>
        </Card>

        {/* Demo credentials */}
        <Card style={styles.demoCard}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.demoTitle}>Demo Credentials</Text>
            <Text style={styles.demoSubtitle}>Email: Any valid email format</Text>
            <Text style={styles.demoSubtitle}>
              Password: <Text style={styles.demoCode}>password</Text>
            </Text>
          </View>
        </Card>

        {/* Social login alternatives */}
        <View style={styles.socialSection}>
          <View style={styles.socialDividerRow}>
            <View style={styles.socialDivider} />
            <Text style={styles.socialDividerText}>or continue with</Text>
            <View style={styles.socialDivider} />
          </View>
          <View style={styles.socialButtonsRow}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <View style={styles.socialIconGoogle}>
                <Text style={styles.socialIconText}>G</Text>
              </View>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <View style={styles.socialIconApple}>
                <Text style={styles.socialIconText}>🍎</Text>
              </View>
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign up link */}
        <View style={styles.signupSection}>
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={onSignup}>
              Sign up
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
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: Colors.light.foreground,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginBottom: 2,
    textAlign: 'center',
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
  alertErrorText: {
    color: Colors.light.error,
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  eyeIcon: {
    fontSize: 18,
    color: Colors.light.mutedForeground,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  submitButton: {
    marginTop: 8,
    width: '100%',
    height: 48,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 13,
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
  socialSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  socialDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialDivider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  socialDividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: Colors.light.mutedForeground,
  },
  socialButtonsRow: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
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
  signupSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  signupText: {
    fontSize: 13,
    color: Colors.light.mutedForeground,
  },
  signupLink: {
    color: Colors.light.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});