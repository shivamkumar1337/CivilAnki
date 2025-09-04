import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Colors } from '../constants/Colors';

interface WelcomeProps {
  onContinue: () => void;
}

export function Welcome({ onContinue }: WelcomeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Fade in animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      delay: 300,
    }).start(() => setIsVisible(true));

    // Auto-advance after 2.5 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 20000);

    return () => clearTimeout(timer);
  }, [onContinue, opacity]);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onContinue}>
      {/* Skip button */}
      <View style={styles.skipContainer}>
        <Button
          variant="ghost"
          onPress={onContinue}
          style={styles.skipButton}
        >
          Skip
        </Button>
      </View>

      {/* Main content */}
      <Animated.View style={[styles.content, { opacity }]}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎯</Text>
        </View>

        {/* App Name */}
        <Text style={styles.title}>CivilAnki</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Master UPSC</Text>
        <Text style={styles.subtitle}>One question at a time</Text>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1,200+</Text>
              <Text style={styles.statLabel}>Questions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Subjects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2 min</Text>
              <Text style={styles.statLabel}>Setup</Text>
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Bottom hint */}
      <View style={styles.bottomHint}>
        <Text style={styles.hintText}>Tap anywhere to continue</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 30,
    justifyContent: 'space-between',
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingTop: 32,
    paddingBottom: 8,
  },
  skipButton: {
    color: Colors.light.mutedForeground,
  },
  content: {
    flex: 1,
    alignItems: 'center',
     justifyContent: 'center',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: Colors.light.foreground,
  },
  tagline: {
    fontSize: 20,
    color: Colors.light.foreground,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.mutedForeground,
    marginBottom: 32,
    textAlign: 'center',
  },
  statsCard: {
    padding: 24,
    marginBottom: 32,
    backgroundColor: Colors.light.accent + '33',
    borderWidth: 0,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.foreground,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: Colors.light.border,
    marginHorizontal: 8,
  },
  bottomHint: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  hintText: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
});