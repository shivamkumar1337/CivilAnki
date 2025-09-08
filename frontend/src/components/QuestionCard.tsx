import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Progress } from './ui/Progress';
import { Colors } from '../constants/Colors';
import { SessionData, ReviewInterval } from '../types';

interface QuestionCardProps {
  sessionData: SessionData;
  onUpdateSession: (data: SessionData) => void;
  onSessionComplete: () => void;
}

type QuestionState = 'answering' | 'correct' | 'incorrect' | 'reviewing';

const reviewOptions = [
  { id: '7min', label: 'Review in 7 min', icon: '⏰', description: 'Soon' },
  { id: '21min', label: 'Review in 21 min', icon: '⏳', description: 'Later today' },
  { id: '21days', label: 'Review in 21 days', icon: '📅', description: 'Long term' },
  { id: 'too-easy', label: 'Too easy — remove', icon: '✅', description: 'Skip future' }
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  sessionData,
  onUpdateSession,
  onSessionComplete
}) => {
  const [state, setState] = useState<QuestionState>('answering');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [showReviewPanel, setShowReviewPanel] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const currentQuestion = sessionData.questions[sessionData.currentQuestionIndex];
  const progress = ((sessionData.currentQuestionIndex + 1) / sessionData.questions.length) * 100;
  
  // Timer for timed mode
  useEffect(() => {
    if (sessionData.mode === 'timed' && state === 'answering' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sessionData.mode, state, timeLeft]);

  // Reset state when question changes
  useEffect(() => {
    setState('answering');
    setSelectedAnswer(null);
    setShowReviewPanel(false);
    setTimeLeft(120);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sessionData.currentQuestionIndex]);

  const handleTimeUp = () => {
    setState('incorrect');
    setTimeout(() => setShowReviewPanel(true), 800);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (state !== 'answering') return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      setState('correct');
      setTimeout(() => {
        recordAnswer(answerIndex, true);
        nextQuestion();
      }, 800);
    } else {
      setState('incorrect');
      setTimeout(() => setShowReviewPanel(true), 800);
    }
  };

  const handleReviewChoice = (interval: ReviewInterval) => {
    recordAnswer(selectedAnswer || -1, false, interval);
    nextQuestion();
  };

  const recordAnswer = (answer: number, isCorrect: boolean, reviewInterval?: ReviewInterval) => {
    const newAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      isCorrect,
      reviewInterval
    };

    onUpdateSession({
      ...sessionData,
      answers: [...sessionData.answers, newAnswer]
    });
  };

  const nextQuestion = () => {
    if (sessionData.currentQuestionIndex + 1 >= sessionData.questions.length) {
      onSessionComplete();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onUpdateSession({
          ...sessionData,
          currentQuestionIndex: sessionData.currentQuestionIndex + 1
        });
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionStyle = (index: number) => {
    if (state === 'answering') {
      return selectedAnswer === index 
        ? [styles.option, styles.selectedOption]
        : styles.option;
    }
    
    if (state === 'correct') {
      return index === currentQuestion.correctAnswer
        ? [styles.option, styles.correctOption]
        : [styles.option, styles.disabledOption];
    }
    
    if (state === 'incorrect') {
      if (index === currentQuestion.correctAnswer) {
        return [styles.option, styles.correctOption];
      }
      if (index === selectedAnswer) {
        return [styles.option, styles.incorrectOption];
      }
      return [styles.option, styles.disabledOption];
    }

    return styles.option;
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Question',
      'Are you sure you want to skip this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            setState('incorrect');
            setTimeout(() => setShowReviewPanel(true), 100);
          }
        }
      ]
    );
  };

  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.questionCounter}>
          <Text style={styles.counterText}>
            Question {sessionData.currentQuestionIndex + 1} of {sessionData.questions.length}
          </Text>
        </View>
        
        {sessionData.mode === 'timed' && state === 'answering' && (
          <View style={[styles.timer, timeLeft < 30 && styles.timerWarning]}>
            <Text style={styles.timerIcon}>⏰</Text>
            <Text style={[styles.timerText, timeLeft < 30 && styles.timerWarningText]}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        )}
      </View>
      
      <Progress value={progress} height={8} style={styles.progressBar} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Question */}
        <Card style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          <View style={styles.questionMeta}>
            <Text style={styles.metaText}>
              {sessionData.selectedSubject?.name} • {currentQuestion.year}
            </Text>
          </View>
        </Card>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(index)}
              onPress={() => handleAnswerSelect(index)}
              disabled={state !== 'answering'}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option}</Text>
                
                {state === 'correct' && index === currentQuestion.correctAnswer && (
                  <Text style={styles.resultIcon}>✅</Text>
                )}
                
                {state === 'incorrect' && index === selectedAnswer && (
                  <Text style={styles.resultIcon}>❌</Text>
                )}
                
                {state === 'incorrect' && index === currentQuestion.correctAnswer && (
                  <Text style={styles.resultIcon}>✅</Text>
                                  )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback Messages */}
        {state === 'correct' && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.correctFeedback}>✅ Correct!</Text>
            <Text style={styles.feedbackSubtext}>Moving to next question...</Text>
          </View>
        )}

        {state === 'incorrect' && !showReviewPanel && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.incorrectFeedback}>❌ Incorrect</Text>
            <Text style={styles.feedbackSubtext}>The correct answer is highlighted</Text>
          </View>
        )}

        {/* Review Panel */}
        {showReviewPanel && (
          <Card style={styles.reviewPanel}>
            <Text style={styles.reviewTitle}>When should we review this again?</Text>
            
            <View style={styles.reviewOptions}>
              {reviewOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.reviewOption}
                  onPress={() => handleReviewChoice(option.id as ReviewInterval)}
                >
                  <View style={styles.reviewOptionContent}>
                    <View style={styles.reviewOptionHeader}>
                      <Text style={styles.reviewOptionIcon}>{option.icon}</Text>
                      <Text style={styles.reviewOptionLabel}>
                        {option.label.split(' ').slice(0, -2).join(' ')}
                      </Text>
                    </View>
                    <Text style={styles.reviewOptionDescription}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}
      </Animated.View>

      {/* Skip Button */}
      {state === 'answering' && (
        <View style={styles.skipContainer}>
          <Button
            title="Skip Question →"
            variant="ghost"
            onPress={handleSkip}
            style={styles.skipButton}
          />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  questionCounter: {
    flex: 1,
  },
  counterText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerWarning: {
    // Warning styles when time is running out
  },
  timerIcon: {
    fontSize: 16,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'monospace',
    color: Colors.light.foreground,
  },
  timerWarningText: {
    color: Colors.light.destructive,
  },
  progressBar: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  questionCard: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: Colors.light.foreground,
    marginBottom: 16,
  },
  questionMeta: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 12,
  },
  metaText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  option: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedOption: {
    backgroundColor: Colors.light.primary + '10',
    borderColor: Colors.light.primary + '40',
  },
  correctOption: {
    backgroundColor: Colors.light.success + '10',
    borderColor: Colors.light.success + '40',
  },
  incorrectOption: {
    backgroundColor: Colors.light.destructive + '10',
    borderColor: Colors.light.destructive + '40',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.foreground,
  },
  resultIcon: {
    fontSize: 20,
  },
  feedbackContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  correctFeedback: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.success,
    marginBottom: 8,
  },
  incorrectFeedback: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.destructive,
    marginBottom: 8,
  },
  feedbackSubtext: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  reviewPanel: {
    backgroundColor: Colors.light.accent + '80',
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.light.foreground,
  },
  reviewOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reviewOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  reviewOptionContent: {
    alignItems: 'flex-start',
  },
  reviewOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reviewOptionIcon: {
    fontSize: 18,
  },
  reviewOptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  reviewOptionDescription: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  skipContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  skipButton: {
    width: '100%',
  },
});