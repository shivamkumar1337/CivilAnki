import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Colors } from '../constants/Colors';
import { SessionData } from '../types';

interface SessionSummaryProps {
  sessionData: SessionData;
  onContinue: () => void;
  onReviewMissed: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  sessionData,
  onContinue,
  onReviewMissed
}) => {
  const totalQuestions = sessionData.answers.length;
  const correctAnswers = sessionData.answers.filter(a => a.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Group answers by review interval
  const reviewIntervals = sessionData.answers.reduce((acc, answer) => {
    if (!answer.isCorrect && answer.reviewInterval) {
      acc[answer.reviewInterval] = (acc[answer.reviewInterval] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return Colors.light.success;
    if (accuracy >= 60) return Colors.light.warning;
    return Colors.light.destructive;
  };

  const getAccuracyMessage = (accuracy: number) => {
    if (accuracy >= 90) return 'Excellent work! 🎉';
    if (accuracy >= 80) return 'Great job! 👏';
    if (accuracy >= 70) return 'Good progress! 👍';
    if (accuracy >= 60) return 'Keep practicing! 💪';
    return 'More practice needed 📚';
  };

  const formatReviewTime = (interval: string) => {
    switch (interval) {
      case '7min': return '7 minutes';
      case '21min': return '21 minutes';  
      case '21days': return '21 days';
      case 'too-easy': return 'Removed from future reviews';
      default: return interval;
    }
  };

  const getReviewIcon = (interval: string) => {
    switch (interval) {
      case '7min': return '⏰';
      case '21min': return '⏳';
      case '21days': return '📅';
      case 'too-easy': return '✅';
      default: return '📝';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '📚'}
          </Text>
          <Text style={styles.title}>Session Complete</Text>
          <Text style={styles.subtitle}>
            {correctAnswers}/{totalQuestions} questions correct
          </Text>
        </View>

        {/* Overall Performance */}
        <Card style={styles.performanceCard}>
          <View style={styles.accuracySection}>
            <Text style={[styles.accuracyScore, { color: getAccuracyColor(accuracy) }]}>
              {accuracy}%
            </Text>
            <Text style={styles.accuracyLabel}>Accuracy Score</Text>
            <Text style={styles.accuracyMessage}>{getAccuracyMessage(accuracy)}</Text>
          </View>

          <View style={styles.resultsGrid}>
            <View style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.correctIcon}>✅</Text>
                <Text style={[styles.resultValue, { color: Colors.light.success }]}>
                  {correctAnswers}
                </Text>
              </View>
              <Text style={styles.resultLabel}>Correct</Text>
            </View>
            
            <View style={styles.resultItem}>
              <View style={styles.resultHeader}>
                <Text style={styles.incorrectIcon}>❌</Text>
                <Text style={[styles.resultValue, { color: Colors.light.destructive }]}>
                  {incorrectAnswers}
                </Text>
              </View>
              <Text style={styles.resultLabel}>Incorrect</Text>
            </View>
          </View>

          <Progress 
            value={accuracy} 
            height={12} 
            style={styles.accuracyProgress}
            progressColor={getAccuracyColor(accuracy)}
          />
        </Card>

        {/* Subject Performance */}
        <Card style={styles.subjectCard}>
          <View style={styles.subjectHeader}>
            <View style={styles.subjectIcon}>
              <Text style={styles.subjectEmoji}>{sessionData.selectedSubject?.icon}</Text>
            </View>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{sessionData.selectedSubject?.name}</Text>
              <Text style={styles.subtopicsText}>
                {sessionData.selectedSubtopics.length} subtopics practiced
              </Text>
            </View>
            <Badge variant="secondary">
              {sessionData.mode === 'timed' ? '⏱️ Timed' : '🔄 Untimed'}
            </Badge>
          </View>
        </Card>

        {/* Review Schedule */}
        {Object.keys(reviewIntervals).length > 0 && (
          <View style={styles.reviewSection}>
            <Text style={styles.sectionTitle}>Review Schedule</Text>
            
            <View style={styles.reviewList}>
              {Object.entries(reviewIntervals).map(([interval, count]) => (
                <Card key={interval} style={styles.reviewCard}>
                  <View style={styles.reviewItem}>
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewIcon}>{getReviewIcon(interval)}</Text>
                      <View style={styles.reviewDetails}>
                        <Text style={styles.reviewCount}>{count} questions</Text>
                        <Text style={styles.reviewTime}>
                          Review in {formatReviewTime(interval)}
                        </Text>
                      </View>
                    </View>
                    
                    {interval !== 'too-easy' && (
                      <View style={styles.reviewTiming}>
                        <Text style={styles.timingText}>
                          {interval === '7min' ? 'Soon' : 
                           interval === '21min' ? 'Today' : 
                           'Long term'}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              ))}
            </View>

            <Card style={styles.tipCard}>
              <View style={styles.tipContent}>
                <View style={styles.tipIcon}>
                  <Text style={styles.tipEmoji}>💡</Text>
                </View>
                <View style={styles.tipText}>
                  <Text style={styles.tipTitle}>Smart Review System</Text>
                  <Text style={styles.tipDescription}>
                    Questions you found difficult will appear more frequently, while easy ones are spaced out further.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Next Steps */}
        <View style={styles.nextStepsSection}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          
          <View style={styles.nextStepsList}>
            <Card style={styles.nextStepCard}>
              <View style={styles.nextStepContent}>
                <View style={styles.nextStepIcon}>
                  <Text style={styles.nextStepEmoji}>✅</Text>
                </View>
                <View style={styles.nextStepText}>
                  <Text style={styles.nextStepTitle}>Correct answers added to long-term memory</Text>
                  <Text style={styles.nextStepDescription}>These will be reviewed at optimal intervals</Text>
                </View>
              </View>
            </Card>

            {incorrectAnswers > 0 && (
              <Card style={styles.nextStepCard}>
                <View style={styles.nextStepContent}>
                  <View style={styles.nextStepIcon}>
                    <Text style={styles.nextStepEmoji}>🔄</Text>
                  </View>
                  <View style={styles.nextStepText}>
                    <Text style={styles.nextStepTitle}>{incorrectAnswers} questions scheduled for review</Text>
                    <Text style={styles.nextStepDescription}>You'll see these again at spaced intervals</Text>
                  </View>
                </View>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {incorrectAnswers > 0 && (
          <Button
            title={`Review Missed Questions (${incorrectAnswers})`}
            variant="outline"
            onPress={onReviewMissed}
            style={styles.actionButton}
          />
        )}
        
        <Button
          title="🏠 Return to Dashboard"
          onPress={onContinue}
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  performanceCard: {
    marginBottom: 24,
  },
  accuracySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  accuracyScore: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  accuracyLabel: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginBottom: 12,
  },
  accuracyMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  resultsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  correctIcon: {
    fontSize: 20,
  },
  incorrectIcon: {
    fontSize: 20,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  resultLabel: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  accuracyProgress: {
    marginTop: 8,
  },
  subjectCard: {
    marginBottom: 24,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectEmoji: {
    fontSize: 20,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  subtopicsText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  reviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 16,
  },
  reviewList: {
    gap: 12,
    marginBottom: 16,
  },
  reviewCard: {
    padding: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reviewIcon: {
    fontSize: 18,
  },
  reviewDetails: {
    flex: 1,
  },
  reviewCount: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 2,
  },
  reviewTime: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  reviewTiming: {
    alignItems: 'flex-end',
  },
  timingText: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  tipCard: {
    backgroundColor: Colors.light.accent + '80',
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipEmoji: {
    fontSize: 12,
  },
  tipText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    lineHeight: 16,
  },
  nextStepsSection: {
    marginBottom: 24,
  },
  nextStepsList: {
    gap: 12,
  },
  nextStepCard: {
    padding: 16,
  },
  nextStepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextStepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepEmoji: {
    fontSize: 20,
  },
  nextStepText: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  nextStepDescription: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  actionButton: {
    height: 44,
  },
});