import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView
} from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Colors } from '../constants/Colors';

interface OnboardingProps {
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    icon: '🎯',
    title: 'Master UPSC Questions',
    description: 'Practice previous-year questions with smart spaced repetition to boost retention'
  },
  {
    icon: '📊',
    title: 'Track Your Progress',
    description: 'Monitor your performance across subjects and identify areas that need focus'
  },
  {
    icon: '⏰',
    title: 'Smart Review System',
    description: 'Questions appear at optimal intervals based on how well you know them'
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Skip button */}
        <View style={styles.header}>
          <Button
            title="Skip"
            variant="ghost"
            onPress={onComplete}
            style={styles.skipButton}
          />
        </View>

        {/* Progress indicators */}
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index === currentStep
                    ? Colors.light.primary
                    : index < currentStep
                    ? Colors.light.primary + '60'
                    : Colors.light.muted
                }
              ]}
            />
          ))}
        </View>

        {/* Main content */}
        <View style={styles.content}>
          <Text style={styles.icon}>{currentStepData.icon}</Text>
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>

          {/* Step-specific content */}
          {currentStep === 0 && (
            <Card style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>📚 Total Questions</Text>
                <Text style={styles.statValue}>1,200+</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>🎯 Subjects Covered</Text>
                <Text style={styles.statValue}>6 Major</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>📅 Years Range</Text>
                <Text style={styles.statValue}>1980-2025</Text>
              </View>
            </Card>
          )}

          {currentStep === 1 && (
            <Card style={styles.progressCard}>
              <Text style={styles.progressValue}>85%</Text>
              <Text style={styles.progressLabel}>Average Score</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '85%' }]} />
              </View>
            </Card>
          )}

          {currentStep === 2 && (
            <Card style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>✅ Easy questions</Text>
                <Text style={styles.reviewDescription}>Skip future reviews</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>⏰ Hard questions</Text>
                <Text style={styles.reviewDescription}>Review in 7 minutes</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>📚 Challenging ones</Text>
                <Text style={styles.reviewDescription}>Review in 21 days</Text>
              </View>
            </Card>
          )}
        </View>

        {/* Bottom section */}
        <View style={styles.bottom}>
          <Button
            title={currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            style={styles.nextButton}
          />

          {currentStep === onboardingSteps.length - 1 && (
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome to CivilAnki</Text>
              <Text style={styles.welcomeDescription}>
                Ready to revise? Let's build your UPSC knowledge systematically.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  skipButton: {
    alignSelf: 'flex-end',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 48,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  icon: {
    fontSize: 64,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.light.foreground,
  },
  description: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    color: Colors.light.mutedForeground,
    marginBottom: 48,
  },
  statsCard: {
    width: '100%',
    backgroundColor: Colors.light.accent + '80',
    borderStyle: 'dashed',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  progressCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.light.accent + '80',
  },
  progressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.light.muted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  reviewCard: {
    width: '100%',
    backgroundColor: Colors.light.accent + '80',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewLabel: {
    fontSize: 14,
    color: Colors.light.foreground,
  },
  reviewDescription: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  bottom: {
    marginTop: 32,
  },
  nextButton: {
    width: '100%',
    height: 48,
  },
  welcomeSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.light.foreground,
  },
  welcomeDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.light.mutedForeground,
  },
});