// components/QuestionScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';
import { Colors } from '../constants/Colors';
import { HomeService } from '../services/HomeService';

// Interfaces
interface ApiQuestion {
  question_id: number;
  question_text: string;
  options: {
    "1": string;
    "2": string;
    "3": string;
    "4": string;
  };
  correct_option: number;
  year: number;
  subject_id: number;
  topic_id: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  year: number;
  question_id: number;
}

// Review intervals configuration - easily customizable from settings
interface ReviewIntervals {
  hard: number;     // minutes  
  good: number;     // days
  easy: number;     // days
}

const DEFAULT_INTERVALS: ReviewIntervals = {
  hard: 21,     // 21 minutes
  good: 1,      // 1 day
  easy: 30      // 30 days
};

type QuestionScreenRouteProp = RouteProp<MainStackParamList, 'QuestionScreen'>;
type QuestionScreenNavigationProp = StackNavigationProp<MainStackParamList, 'QuestionScreen'>;

export const QuestionScreen: React.FC = () => {
  const navigation = useNavigation<QuestionScreenNavigationProp>();
  const route = useRoute<QuestionScreenRouteProp>();
  const { subject, subTopic, questionParams } = route.params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showMarkingOptions, setShowMarkingOptions] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [againQuestions, setAgainQuestions] = useState<Question[]>([]); // Queue for "again" questions
  
  // This can be loaded from settings/preferences in future
  const [reviewIntervals] = useState<ReviewIntervals>(DEFAULT_INTERVALS);

  const transformQuestion = (apiQuestion: ApiQuestion): Question => {
    return {
      id: apiQuestion.question_id.toString(),
      question: apiQuestion.question_text,
      options: [
        apiQuestion.options["1"],
        apiQuestion.options["2"],
        apiQuestion.options["3"],
        apiQuestion.options["4"]
      ],
      correctAnswer: apiQuestion.correct_option - 1,
      year: apiQuestion.year,
      explanation: `This question is from ${apiQuestion.year}.`,
      question_id: apiQuestion.question_id
    };
  };

  const calculateNextReviewTime = (difficulty: keyof ReviewIntervals): string => {
    const now = new Date();
    
    switch (difficulty) {
      case 'hard':
        // Add 21 minutes (or configured value)
        now.setMinutes(now.getMinutes() + reviewIntervals.hard);
        break;
      case 'good':
        // Next day
        now.setDate(now.getDate() + reviewIntervals.good);
        now.setHours(9, 0, 0, 0); // Set to 9 AM next day
        break;
      case 'easy':
        // One month later (or configured days)
        now.setDate(now.getDate() + reviewIntervals.easy);
        now.setHours(9, 0, 0, 0); // Set to 9 AM
        break;
      default:
        now.setDate(now.getDate() + 1);
    }
    
    return now.toISOString();
  };

  const getReviewInterval = (difficulty: keyof ReviewIntervals): string => {
    switch (difficulty) {
      case 'hard':
        return `${reviewIntervals.hard}m`;
      case 'good':
        return `${reviewIntervals.good}d`;
      case 'easy':
        return `${reviewIntervals.easy}d`;
      default:
        return '1d';
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        let params = {};

        if (questionParams) {
          params = questionParams;
        } else if (subject && subTopic) {
          params = {
            status: 'unattempted',
            subject_id: subject.id,
            topic_id: subTopic.id
          };
        } else {
          throw new Error('Invalid navigation parameters');
        }

        const response = await HomeService.getProgress(params);
        console.log('Fetched questions:', response);

        if (response.questions && response.count > 0) {
          const transformedQuestions = response.questions.map(transformQuestion);
          setQuestions(transformedQuestions);
        } else {
          setError('No questions found for this selection.');
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [subject, subTopic, questionParams]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length + againQuestions.length;
  const currentDisplayIndex = currentQuestionIndex + 1;

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setShowResult(true);
    setShowMarkingOptions(true);
  };

  const handleNextQuestion = () => {
    // Check if there are "again" questions to show first
    if (againQuestions.length > 0) {
      // Move to the next "again" question
      const nextAgainQuestion = againQuestions[0];
      const remainingAgainQuestions = againQuestions.slice(1);
      
      // Add current question back to the main questions and move to "again" question
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = nextAgainQuestion;
      
      setQuestions(updatedQuestions);
      setAgainQuestions(remainingAgainQuestions);
      setSelectedOption(null);
      setShowResult(false);
      setShowMarkingOptions(false);
      return;
    }

    // Normal flow - move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowMarkingOptions(false);
    } else {
      navigation.goBack();
    }
  };

  const handleMarkQuestion = async (difficulty: 'again' | keyof ReviewIntervals) => {
    if (!currentQuestion) return;

    // Handle "again" separately - no API call, just add to queue
    if (difficulty === 'again') {
      setAgainQuestions(prev => [...prev, currentQuestion]);
      setShowMarkingOptions(false);
      
      // Small delay for better UX
      setTimeout(() => {
        handleNextQuestion();
      }, 300);
      return;
    }

    // Handle other difficulties with API call
    if (updating) return;

    setUpdating(true);
    try {
      const isCorrect = selectedOption === currentQuestion.correctAnswer;
      const nextReviewTime = calculateNextReviewTime(difficulty);
      const reviewInterval = getReviewInterval(difficulty);

      await HomeService.updateProgress({
        question_id: currentQuestion.question_id,
        correct: isCorrect,
        review_interval: reviewInterval,
        next_review_at: nextReviewTime
      });

      setShowMarkingOptions(false);
      
      // Small delay for better UX
      setTimeout(() => {
        handleNextQuestion();
      }, 300);
    } catch (error) {
      console.error('Failed to update progress:', error);
      // Still proceed to next question even if API fails
      setShowMarkingOptions(false);
      setTimeout(() => {
        handleNextQuestion();
      }, 300);
    } finally {
      setUpdating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setQuestions([]);
    setAgainQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setShowMarkingOptions(false);
    setUpdating(false);
  };

  const getScreenTitle = () => {
    if (questionParams?.status === 'today') {
      return "Today's Questions";
    }
    if (subTopic) {
      return subTopic.name;
    }
    return "Questions";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
        </View>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
        </View>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <Text style={styles.loadingText}>No questions available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
          <Text style={styles.headerSubtitle}>
            {currentDisplayIndex} of {totalQuestions}
            {againQuestions.length > 0 && (
              <Text style={styles.againIndicator}> • {againQuestions.length} to retry</Text>
            )}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${(currentDisplayIndex / totalQuestions) * 100}%` }
          ]} 
        />
      </View>

      <View style={styles.contentContainer}>
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentPadding}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>
              Question {currentDisplayIndex} • Year {currentQuestion.year}
            </Text>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => !showResult && handleOptionSelect(index)}
                disabled={showResult}
                style={[
                  styles.optionButton,
                  showResult
                    ? index === currentQuestion.correctAnswer
                      ? styles.correctOption
                      : index === selectedOption && index !== currentQuestion.correctAnswer
                      ? styles.wrongOption
                      : styles.disabledOption
                    : selectedOption === index
                    ? styles.selectedOption
                    : styles.defaultOption
                ]}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionLetter,
                    showResult
                      ? index === currentQuestion.correctAnswer
                        ? styles.correctOptionLetter
                        : index === selectedOption && index !== currentQuestion.correctAnswer
                        ? styles.wrongOptionLetter
                        : styles.disabledOptionLetter
                      : selectedOption === index
                      ? styles.selectedOptionLetter
                      : styles.defaultOptionLetter
                  ]}>
                    <Text style={[
                      styles.optionLetterText,
                      (selectedOption === index || (showResult && index === currentQuestion.correctAnswer))
                        ? { color: Colors.light.primaryForeground }
                        : { color: Colors.light.mutedForeground }
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {showResult && currentQuestion.explanation && (
            <View style={styles.explanationContainer}>
              <View style={styles.explanationHeader}>
                <Ionicons name="bulb-outline" size={16} color={Colors.light.primary} />
                <Text style={styles.explanationTitle}>Explanation</Text>
              </View>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            </View>
          )}
        </ScrollView>

        {showMarkingOptions && (
          <View style={styles.markingContainer}>
            <Text style={styles.markingTitle}>How would you rate this question?</Text>
            <View style={styles.markingButtons}>
              <TouchableOpacity
                onPress={() => handleMarkQuestion('again')}
                style={[styles.markingButton, styles.againButton]}
              >
                <Ionicons name="refresh" size={16} color="#ef4444" />
                <Text style={styles.againText}>Again</Text>
                <Text style={styles.intervalText}>Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleMarkQuestion('hard')}
                disabled={updating}
                style={[styles.markingButton, styles.hardButton, updating && styles.disabledButton]}
              >
                <Ionicons name="flame" size={16} color="#f97316" />
                <Text style={styles.hardText}>Hard</Text>
                <Text style={styles.intervalText}>{reviewIntervals.hard}m</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleMarkQuestion('good')}
                disabled={updating}
                style={[styles.markingButton, styles.goodButton, updating && styles.disabledButton]}
              >
                <Ionicons name="thumbs-up" size={16} color="#3b82f6" />
                <Text style={styles.goodText}>Good</Text>
                <Text style={styles.intervalText}>{reviewIntervals.good}d</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleMarkQuestion('easy')}
                disabled={updating}
                style={[styles.markingButton, styles.easyButton, updating && styles.disabledButton]}
              >
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text style={styles.easyText}>Easy</Text>
                <Text style={styles.intervalText}>{reviewIntervals.easy}d</Text>
              </TouchableOpacity>
            </View>
            {updating && (
              <View style={styles.updatingIndicator}>
                <ActivityIndicator size="small" color={Colors.light.primary} />
                <Text style={styles.updatingText}>Saving progress...</Text>
              </View>
            )}
          </View>
        )}

        {showResult && !showMarkingOptions && (
          <View style={styles.continueContainer}>
            <TouchableOpacity onPress={handleNextQuestion} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>
                {(currentQuestionIndex < questions.length - 1) || againQuestions.length > 0 ? 'Next Question' : 'Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.foreground,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginTop: 2,
  },
  againIndicator: {
    color: '#ef4444',
    fontWeight: '500',
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.light.muted,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: 16,
    paddingBottom: 32,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.mutedForeground,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.light.primaryForeground,
    fontSize: 16,
    fontWeight: '600',
  },
  questionContainer: {
    marginBottom: 24,
  },
  questionNumber: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    color: Colors.light.foreground,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  defaultOption: {
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  selectedOption: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.accent,
  },
  correctOption: {
    borderColor: '#22c55e',
    backgroundColor: '#dcfce7',
  },
  wrongOption: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  disabledOption: {
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.muted,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  defaultOptionLetter: {
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  selectedOptionLetter: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  correctOptionLetter: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e',
  },
  wrongOptionLetter: {
    borderColor: '#ef4444',
    backgroundColor: '#ef4444',
  },
  disabledOptionLetter: {
    borderColor: Colors.light.mutedForeground,
    backgroundColor: Colors.light.muted,
  },
  optionLetterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionText: {
    fontSize: 16,
    color: Colors.light.foreground,
    flex: 1,
  },
  explanationContainer: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    padding: 16,
    backgroundColor: Colors.light.accent,
    marginBottom: 24,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.light.primary,
    lineHeight: 20,
  },
  markingContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    padding: 16,
  },
  markingTitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    marginBottom: 12,
  },
  markingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  markingButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  againButton: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  hardButton: {
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
  },
  goodButton: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
  },
  easyButton: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  againText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    fontWeight: '500',
  },
  hardText: {
    fontSize: 12,
    color: '#f97316',
    marginTop: 4,
    fontWeight: '500',
  },
  goodText: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '500',
  },
  easyText: {
    fontSize: 12,
    color: '#22c55e',
    marginTop: 4,
    fontWeight: '500',
  },
  intervalText: {
    fontSize: 10,
    color: Colors.light.mutedForeground,
    marginTop: 2,
  },
  updatingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  updatingText: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    marginLeft: 8,
  },
  continueContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    padding: 16,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primaryForeground,
  },
});
