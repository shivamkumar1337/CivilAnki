// screens/auth/UserOnboarding.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { authService } from '../../services/AuthService';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import { setAuthenticated } from '../../store/slices/authSlice';
import { setUser } from '../../store/slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

type UserOnboardingRouteProp = RouteProp<AuthStackParamList, 'UserOnboarding'>;
type UserOnboardingNavigationProp = StackNavigationProp<AuthStackParamList, 'UserOnboarding'>;

interface GoalOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'UPSC',
    title: 'UPSC',
    subtitle: 'Civil Services',
    icon: 'library',
    color: '#3B82F6',
  },
  {
    id: 'CDS',
    title: 'CDS',
    subtitle: 'Combined Defence Services',
    icon: 'shield',
    color: '#10B981',
  },
  {
    id: 'CAPF',
    title: 'CAPF',
    subtitle: 'Central Armed Police Forces',
    icon: 'star',
    color: '#F59E0B',
  },
  {
    id: 'PCS',
    title: 'PCS',
    subtitle: 'Provincial Civil Services',
    icon: 'business',
    color: '#8B5CF6',
  },
];

const CURRENT_YEAR = new Date().getFullYear();
const TARGET_YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + i);

export function UserOnboarding() {
  const route = useRoute<UserOnboardingRouteProp>();
  const navigation = useNavigation<UserOnboardingNavigationProp>();
  const dispatch = useDispatch();
  
  const { userId, mobile } = route.params;
  const [name, setName] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [targetYear, setTargetYear] = useState<number>(CURRENT_YEAR + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Name, 2: Goal Selection

  const handleNext = () => {
    if (currentStep === 1) {
      if (name.trim().length < 2) {
        setError('Please enter a valid name (at least 2 characters)');
        return;
      }
      setError('');
      setCurrentStep(2);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!selectedGoal) {
      setError('Please select your goal');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError('');

    try {
      // Update user profile with onboarding data
      const profileData = {
        name: name.trim(),
        goal: selectedGoal,
        target_year: targetYear,
        onboarding_completed: true,
      };
  setLoading(true);
       await authService.createProfile({
      id: userId, // get from session or OTP verification
      name,
      goal:selectedGoal,
      target_year:targetYear,
      mobile,
    });

      // Set user data in Redux store
      const userDataStore = {
        id: userId,
        mobile: mobile,
        name: name.trim(),
        goal: selectedGoal,
        target_year: targetYear,
        email: '',
        isAuthenticated: true,
        onboarding_completed: true,
      };

      dispatch(setUser(userDataStore));
      dispatch(setAuthenticated(true));

      // Navigation handled by Redux state change
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
    }

    setLoading(false);
  };

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>What should we call you?</Text>
        <Text style={styles.stepSubtitle}>
          Enter your name to personalize your learning experience
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.nameInput}
          placeholder="Enter your full name"
          placeholderTextColor={Colors.light.mutedForeground}
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError('');
          }}
          editable={!loading}
          autoFocus
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>
    </View>
  );

  const renderGoalStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Choose Your Goal</Text>
        <Text style={styles.stepSubtitle}>
          Select your target exam to get personalized content
        </Text>
      </View>

      <View style={styles.goalsGrid}>
        {GOAL_OPTIONS.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalTile,
              selectedGoal === goal.id && [
                styles.goalTileSelected,
                { borderColor: goal.color }
              ]
            ]}
            onPress={() => {
              setSelectedGoal(goal.id);
              setError('');
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedGoal === goal.id
                  ? [goal.color + '20', goal.color + '10']
                  : [Colors.light.secondary, Colors.light.secondary]
              }
              style={styles.goalIconContainer}
            >
              <Ionicons
                name={goal.icon as any}
                size={24}
                color={selectedGoal === goal.id ? goal.color : Colors.light.mutedForeground}
              />
            </LinearGradient>
            <Text style={[
              styles.goalTitle,
              selectedGoal === goal.id && { color: goal.color }
            ]}>
              {goal.title}
            </Text>
            <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
            {selectedGoal === goal.id && (
              <View style={[styles.selectedIndicator, { backgroundColor: goal.color }]}>
                <Ionicons name="checkmark" size={12} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {selectedGoal && (
        <View style={styles.yearSection}>
          <Text style={styles.yearLabel}>Target Year</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearScroll}
          >
            {TARGET_YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearTile,
                  targetYear === year && styles.yearTileSelected
                ]}
                onPress={() => setTargetYear(year)}
              >
                <Text style={[
                  styles.yearText,
                  targetYear === year && styles.yearTextSelected
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => currentStep === 1 ? navigation.goBack() : setCurrentStep(1)}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.light.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setup Profile</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>{currentStep}/2</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[Colors.light.primary, '#1D4ED8']}
              style={[styles.progressFill, { width: `${(currentStep / 2) * 100}%` }]}
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 ? renderNameStep() : renderGoalStep()}

          {/* Error Display */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={Colors.light.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              ((currentStep === 1 && name.trim().length < 2) || 
               (currentStep === 2 && !selectedGoal) || 
               loading) && styles.continueButtonDisabled
            ]}
            disabled={
              (currentStep === 1 && name.trim().length < 2) || 
              (currentStep === 2 && !selectedGoal) || 
              loading
            }
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                ((currentStep === 1 && name.trim().length >= 2) || 
                 (currentStep === 2 && selectedGoal)) && !loading
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
                      styles.continueButtonText,
                      ((currentStep === 1 && name.trim().length < 2) || 
                       (currentStep === 2 && !selectedGoal) || 
                       loading) && styles.continueButtonTextDisabled
                    ]}>
                      {currentStep === 2 ? 'Complete Setup' : 'Continue'}
                    </Text>
                    <Ionicons 
                      name={currentStep === 2 ? "checkmark" : "arrow-forward"} 
                      size={16} 
                      color={
                        ((currentStep === 1 && name.trim().length >= 2) || 
                         (currentStep === 2 && selectedGoal)) && !loading
                          ? Colors.light.primaryForeground 
                          : Colors.light.mutedForeground
                      } 
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
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
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
  stepIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.light.primary + '10',
    borderRadius: 12,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.light.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.light.mutedForeground,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 8,
  },
  nameInput: {
    borderRadius: 12,
    backgroundColor: Colors.light.input,
    borderWidth: 2,
    borderColor: Colors.light.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  goalTile: {
    width: '47%',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
    position: 'relative',
  },
  goalTileSelected: {
    borderWidth: 2,
    backgroundColor: Colors.light.background,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearSection: {
    marginBottom: 24,
  },
  yearLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 12,
  },
  yearScroll: {
    paddingHorizontal: 4,
    gap: 12,
  },
  yearTile: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.light.secondary,
    borderRadius: 12,
    marginRight: 12,
  },
  yearTileSelected: {
    backgroundColor: Colors.light.primary,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.foreground,
  },
  yearTextSelected: {
    color: Colors.light.primaryForeground,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.error + '10',
    borderColor: Colors.light.error + '30',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
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
  continueButtonText: {
    color: Colors.light.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  continueButtonTextDisabled: {
    color: Colors.light.mutedForeground,
  },
});
