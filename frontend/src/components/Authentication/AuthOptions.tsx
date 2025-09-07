import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../constants/Colors';
import { AuthStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type AuthOptionsNavigationProp = StackNavigationProp<AuthStackParamList, 'AuthOptions'>;

export function AuthOptions() {
  const navigation = useNavigation<AuthOptionsNavigationProp>();
  const dispatch = useDispatch();
  const [error, setError] = useState<string>('');

  const handleMobileAuth = () => {
    navigation.navigate('MobileAuth');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      {/* Hero Section with animated gradient */}
      <LinearGradient
        colors={['#EFF6FF', '#DBEAFE', '#BFDBFE']}
        style={styles.heroSection}
      >
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        
        <View style={styles.heroContent}>
          {/* Logo with pulse effect */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[Colors.light.primary, '#1D4ED8']}
              style={styles.logoBox}
            >
              <Ionicons name="school" size={36} color={Colors.light.primaryForeground} />
            </LinearGradient>
            <View style={styles.logoGlow} />
          </View>
          
          {/* Main heading */}
          <Text style={styles.mainTitle}>
            Master UPSC with{'\n'}
            <Text style={styles.brandName}>CivilAnki</Text>
          </Text>
          
          {/* Compelling subtitle */}
          <Text style={styles.heroSubtitle}>
            Smart spaced repetition • 10,000+ questions
          </Text>
          
          {/* Value proposition */}
          <View style={styles.valueSection}>
            <View style={styles.valueGrid}>
              <View style={styles.valueItem}>
                <View style={styles.valueIcon}>
                  <Ionicons name="infinite" size={20} color={Colors.light.primary} />
                </View>
                <Text style={styles.valueText}>Smart Revision</Text>
              </View>
              <View style={styles.valueItem}>
                <View style={styles.valueIcon}>
                  <Ionicons name="trending-up" size={20} color={Colors.light.success} />
                </View>
                <Text style={styles.valueText}>Track Progress</Text>
              </View>
              <View style={styles.valueItem}>
                <View style={styles.valueIcon}>
                  <Ionicons name="time" size={20} color={Colors.light.warning} />
                </View>
                <Text style={styles.valueText}>Save Time</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Action Section */}
      <View style={styles.actionSection}>
        {/* Error display */}
        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color={Colors.light.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* CTA Section */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>Start Your Revision Journey</Text>
          <Text style={styles.ctaSubtitle}>Smart algorithm shows you questions at optimal intervals</Text>
        </View>

        {/* Primary CTA Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleMobileAuth}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.light.primary, '#1D4ED8']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIconContainer}>
                <Ionicons name="rocket" size={20} color={Colors.light.primaryForeground} />
              </View>
              <Text style={styles.primaryButtonText}>Start Learning Now</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.light.primaryForeground} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Trust indicators
        <View style={styles.trustSection}>
          <View style={styles.trustRow}>
            <Ionicons name="library" size={16} color={Colors.light.success} />
            <Text style={styles.trustText}>10k+ PYQs</Text>
          </View>
          <View style={styles.trustRow}>
            <Ionicons name="calendar" size={16} color={Colors.light.warning} />
            <Text style={styles.trustText}>1980-2024</Text>
          </View>
          <View style={styles.trustRow}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.trustText}>Detailed Solutions</Text>
          </View>
        </View> */}

        {/* Terms with better styling */}
        <View style={styles.termsSection}>
          <View style={styles.termsContainer}>
            <Ionicons name="information-circle" size={14} color={Colors.light.mutedForeground} />
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText}>Terms</Text>
              {' '}and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
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
  heroSection: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.primary + '15',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary + '10',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
    width: '100%',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  logoGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 23,
    backgroundColor: Colors.light.primary + '20',
    zIndex: -1,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.light.foreground,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  brandName: {
    color: Colors.light.primary,
    fontSize: 28,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
    paddingHorizontal: 16,
  },
  valueSection: {
    width: '100%',
  },
  valueGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  valueItem: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 80,
  },
  valueIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  valueText: {
    fontSize: 11,
    color: Colors.light.foreground,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  actionSection: {
    paddingHorizontal: 32,
    paddingBottom: 50,
    paddingTop: 24,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.error + '10',
    borderColor: Colors.light.error + '30',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  ctaContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 6,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  primaryButton: {
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconContainer: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: Colors.light.primaryForeground,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.2,
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 24,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: Colors.light.accent,
    borderRadius: 12,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  trustText: {
    fontSize: 11,
    color: Colors.light.foreground,
    fontWeight: '600',
    marginLeft: 4,
  },
  termsSection: {
    alignItems: 'center',
    marginTop: 100,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.muted,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    maxWidth: '100%',
  },
  termsText: {
    fontSize: 11,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    lineHeight: 16,
    marginLeft: 6,
    flex: 1,
  },
  linkText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});