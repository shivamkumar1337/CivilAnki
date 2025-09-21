// components/QuestionScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';
import { Colors } from '../constants/Colors';
import { HomeService } from '../services/HomeService';
import { Question } from '../types';

type QuestionScreenRouteProp = RouteProp<MainStackParamList, 'QuestionScreen'>;
type QuestionScreenNavigationProp = StackNavigationProp<MainStackParamList, 'QuestionScreen'>;

export const QuestionScreen: React.FC = () => {
  const navigation = useNavigation<QuestionScreenNavigationProp>();
  const route = useRoute<QuestionScreenRouteProp>();
  const { subject, subTopic, questionParams } = route.params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showQualityRating, setShowQualityRating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  const transformApiQuestion = (apiQuestion: any): Question => {
    const options = Array.isArray(apiQuestion.options) 
      ? apiQuestion.options 
      : [
          apiQuestion.options["1"],
          apiQuestion.options["2"], 
          apiQuestion.options["3"],
          apiQuestion.options["4"]
        ];

    return {
      id: apiQuestion.question_id?.toString() || apiQuestion.id?.toString(),
      question_id: apiQuestion.question_id || apiQuestion.id,
      question: apiQuestion.question_text,
      question_text: apiQuestion.question_text,
      options,
      correctAnswer: (apiQuestion.correct_option || apiQuestion.correctAnswer) - 1,
      correct_option: apiQuestion.correct_option || apiQuestion.correctAnswer,
      year: apiQuestion.year,
      subject_id: apiQuestion.subject_id,
      topic_id: apiQuestion.topic_id,
      exam_id: apiQuestion.exam_id,
      image_url: apiQuestion.image_url,
      explanation: apiQuestion.explanation || `This question is from ${apiQuestion.year}.`,
      // Spaced repetition fields
      card_type: apiQuestion.card_type || 'new',
      ease_factor: apiQuestion.ease_factor,
      interval_days: apiQuestion.interval_days,
      repetitions: apiQuestion.repetitions,
      next_review_at: apiQuestion.next_review_at,
      attempts: apiQuestion.attempts,
      lapses: apiQuestion.lapses,
      topic_name: apiQuestion.topic_name
    };
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
            topic_id: subTopic.id,
            limit: 20
          };
        } else {
          throw new Error('Invalid navigation parameters');
        }

        const response = await HomeService.getProgress(params);
        console.log('Fetched questions:', response);

        if (response.questions && response.count > 0) {
          const transformedQuestions = response.questions.map(transformApiQuestion);
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
  const totalQuestions = questions.length;

  const handleOptionSelect = (optionIndex: number) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
    setShowResult(true);
    
    // Show quality rating after a brief delay
    setTimeout(() => {
      setShowQualityRating(true);
    }, 1000);
  };

  const handleQualityRating = async (quality: number) => {
    if (!currentQuestion || updating) return;

    setUpdating(true);
    try {
      const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000);
      
      await HomeService.submitAnswer({
        question_id: currentQuestion.question_id,
        quality: quality,
        time_taken: timeSpent
      });

      setShowQualityRating(false);
      
      // Move to next question after a brief delay
      setTimeout(() => {
        handleNextQuestion();
      }, 500);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      Alert.alert('Error', 'Failed to save progress. Continue anyway?', [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            setShowQualityRating(false);
            setTimeout(() => handleNextQuestion(), 500);
          }
        }
      ]);
    } finally {
      setUpdating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowQualityRating(false);
    } else {
      // Session complete
      navigation.goBack();
    }
  };

  const getScreenTitle = () => {
    if (questionParams?.status === 'due') return "Due for Review";
    if (questionParams?.status === 'today') return "Today's Questions";
    if (questionParams?.status === 'learning') return "Learning";
    if (questionParams?.status === 'review') return "Review";
    if (subTopic) return subTopic.name;
    return "Questions";
  };

  const getCardTypeInfo = (cardType?: string) => {
    switch (cardType) {
      case 'new': return { icon: '✨', label: 'New', color: Colors.light.primary };
      case 'learning': return { icon: '📚', label: 'Learning', color: Colors.light.warning };
      case 'review': return { icon: '🔄', label: 'Review', color: Colors.light.success };
      case 'relearning': return { icon: '🔁', label: 'Relearning', color: Colors.light.destructive };
      default: return { icon: '❓', label: 'Unknown', color: Colors.light.mutedForeground };
    }
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
          <Text style={styles.loadingText}>Loading questions...</Text>
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
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
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

  const cardInfo = getCardTypeInfo(currentQuestion.card_type);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
          <Text style={styles.headerSubtitle}>
            {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
        </View>
        <View style={[styles.cardTypeBadge, { backgroundColor: cardInfo.color + '20' }]}>
          <Text style={styles.cardTypeIcon}>{cardInfo.icon}</Text>
          <Text style={[styles.cardTypeText, { color: cardInfo.color }]}>
            {cardInfo.label}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }
          ]} 
        />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionContainer}>
          <View style={styles.questionMeta}>
            <Text style={styles.questionNumber}>Question {currentQuestionIndex + 1}</Text>
            <Text style={styles.questionYear}>Year {currentQuestion.year}</Text>
            {currentQuestion.topic_name && (
              <Text style={styles.topicName}>{currentQuestion.topic_name}</Text>
            )}
          </View>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleOptionSelect(index)}
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

      {showQualityRating && (
          <View style={styles.markingContainer}>
            <Text style={styles.markingTitle}>How would you rate this question?</Text>
            <View style={styles.markingButtons}>
              <TouchableOpacity
                onPress={() => handleQualityRating(0)}
                style={[styles.markingButton, styles.againButton]}
              >
                <Ionicons name="refresh" size={16} color="#ef4444" />
                <Text style={styles.againText}>Again</Text>
                {/* <Text style={styles.intervalText}>Now</Text> */}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleQualityRating(1)}
                disabled={updating}
                style={[styles.markingButton, styles.hardButton, updating && styles.disabledButton]}
              >
                <Ionicons name="flame" size={16} color="#f97316" />
                <Text style={styles.hardText}>Hard</Text>
                {/* <Text style={styles.intervalText}></Text> */}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleQualityRating(2)}
                disabled={updating}
                style={[styles.markingButton, styles.goodButton, updating && styles.disabledButton]}
              >
                <Ionicons name="thumbs-up" size={16} color="#3b82f6" />
                <Text style={styles.goodText}>Good</Text>
                {/* <Text style={styles.intervalText}>{reviewIntervals.good}d</Text> */}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleQualityRating(3)}
                disabled={updating}
                style={[styles.markingButton, styles.easyButton, updating && styles.disabledButton]}
              >
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <Text style={styles.easyText}>Easy</Text>
                {/* <Text style={styles.intervalText}>{reviewIntervals.easy}d</Text> */}
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
  cardTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  cardTypeIcon: {
    fontSize: 12,
  },
  cardTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.light.muted,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
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
    color: Colors.light.error,
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
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  questionNumber: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    fontWeight: '500',
  },
  questionYear: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  topicName: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
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
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.success + '20',
  },
  wrongOption: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.error + '20',
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
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.success,
  },
  wrongOptionLetter: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.error,
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
  qualityContainer: {
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    padding: 16,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.foreground,
    textAlign: 'center',
    marginBottom: 4,
  },
  qualitySubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    marginBottom: 16,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  againButton: {
    borderColor: Colors.light.error + '40',
    backgroundColor: Colors.light.error + '10',
  },
  hardButton: {
    borderColor: Colors.light.warning + '40',
    backgroundColor: Colors.light.warning + '10',
  },
  goodButton: {
    borderColor: Colors.light.primary + '40',
    backgroundColor: Colors.light.primary + '10',
  },
  easyButton: {
    borderColor: Colors.light.success + '40',
    backgroundColor: Colors.light.success + '10',
  },
  qualityIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  qualityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 2,
  },
  qualityDescription: {
    fontSize: 10,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
  },
  updatingIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  updatingText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginLeft: 8,
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
  // againButton: {
  //   borderColor: '#fecaca',
  //   backgroundColor: '#fef2f2',
  // },
  // hardButton: {
  //   borderColor: '#fed7aa',
  //   backgroundColor: '#fff7ed',
  // },
  // goodButton: {
  //   borderColor: '#bfdbfe',
  //   backgroundColor: '#eff6ff',
  // },
  // easyButton: {
  //   borderColor: '#bbf7d0',
  //   backgroundColor: '#f0fdf4',
  // },
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
  // updatingIndicator: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginTop: 12,
  // },
  // updatingText: {
  //   fontSize: 12,
  //   color: Colors.light.mutedForeground,
  //   marginLeft: 8,
  // },
});