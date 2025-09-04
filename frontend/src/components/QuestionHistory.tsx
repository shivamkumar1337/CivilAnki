import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { Colors } from '../constants/Colors';

interface QuestionHistoryProps {
  onBack: () => void;
}

interface HistoryItem {
  id: string;
  question: string;
  subject: string;
  subtopic: string;
  attempts: {
    date: string;
    isCorrect: boolean;
    timeSpent: number;
    reviewInterval?: string;
  }[];
  nextReview?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  year: number;
}

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    question: 'Which Article of the Indian Constitution deals with the Right to Equality?',
    subject: 'Polity',
    subtopic: 'Constitution',
    difficulty: 'medium',
    year: 2019,
    attempts: [
      { date: '2024-01-15T10:30:00Z', isCorrect: false, timeSpent: 45, reviewInterval: '7min' },
      { date: '2024-01-15T10:37:00Z', isCorrect: true, timeSpent: 32 }
    ],
    nextReview: '2024-01-22T10:37:00Z'
  },
  {
    id: '2',
    question: 'The Quit India Movement was launched in which year?',
    subject: 'History',
    subtopic: 'Modern India',
    difficulty: 'easy',
    year: 2018,
    attempts: [
      { date: '2024-01-14T14:15:00Z', isCorrect: true, timeSpent: 28 }
    ],
    nextReview: '2024-02-04T14:15:00Z'
  },
  {
    id: '3',
    question: 'Which river is known as the "Sorrow of Bengal"?',
    subject: 'Geography',
    subtopic: 'Indian Geography',
    difficulty: 'hard',
    year: 2020,
    attempts: [
      { date: '2024-01-13T16:20:00Z', isCorrect: false, timeSpent: 78, reviewInterval: '21min' },
      { date: '2024-01-13T16:41:00Z', isCorrect: false, timeSpent: 65, reviewInterval: '21days' }
    ],
    nextReview: '2024-02-03T16:41:00Z'
  }
];

export const QuestionHistory: React.FC<QuestionHistoryProps> = ({ onBack }) => {
  const [selectedTab, setSelectedTab] = useState<'recent' | 'due' | 'analytics'>('recent');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return Colors.light.success;
      case 'medium': return Colors.light.warning;
      case 'hard': return Colors.light.destructive;
      default: return Colors.light.mutedForeground;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatNextReview = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return `In ${Math.floor(diffDays / 7)} weeks`;
  };

  const getOverallStats = () => {
    const totalAttempts = mockHistory.reduce((sum, item) => sum + item.attempts.length, 0);
    const correctAttempts = mockHistory.reduce((sum, item) => 
      sum + item.attempts.filter(a => a.isCorrect).length, 0
    );
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
    
    return { totalAttempts, correctAttempts, accuracy };
  };

  const stats = getOverallStats();

  const dueToday = mockHistory.filter(item => {
    if (!item.nextReview) return false;
    const today = new Date().toDateString();
    const reviewDate = new Date(item.nextReview).toDateString();
    return reviewDate <= today;
  });

  const recentlyPracticed = mockHistory
    .filter(item => item.attempts.length > 0)
    .sort((a, b) => new Date(b.attempts[b.attempts.length - 1].date).getTime() - 
                    new Date(a.attempts[a.attempts.length - 1].date).getTime())
    .slice(0, 10);

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const lastAttempt = item.attempts[item.attempts.length - 1];
    const totalAttempts = item.attempts.length;
    const correctAttempts = item.attempts.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctAttempts / totalAttempts) * 100);

    return (
      <Card style={styles.historyCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionText} numberOfLines={2}>
            {item.question}
          </Text>
          <Badge 
            variant="secondary" 
            style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}
          >
            <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
              {item.difficulty}
            </Text>
          </Badge>
        </View>
        
        <View style={styles.questionMeta}>
          <Text style={styles.metaText}>{item.subject}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{item.year}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{formatDate(lastAttempt.date)}</Text>
        </View>

        <View style={styles.questionStats}>
          <View style={styles.statsLeft}>
            <View style={styles.resultIndicator}>
              <Text style={styles.resultIcon}>
                {lastAttempt.isCorrect ? '✅' : '❌'}
              </Text>
              <Text style={styles.accuracyText}>
                {correctAttempts}/{totalAttempts} ({accuracy}%)
              </Text>
            </View>
            
            <View style={styles.timeIndicator}>
              <Text style={styles.timeIcon}>⏱️</Text>
              <Text style={styles.timeText}>{lastAttempt.timeSpent}s</Text>
            </View>
          </View>

          {item.nextReview && (
            <Badge variant="outline" style={styles.reviewBadge}>
              {formatNextReview(item.nextReview)}
            </Badge>
          )}
        </View>

        {totalAttempts > 1 && (
          <View style={styles.attemptHistory}>
            <Text style={styles.attemptHistoryLabel}>Attempt History</Text>
            <View style={styles.attemptDots}>
              {item.attempts.slice(-8).map((attempt, index) => (
                <View
                  key={index}
                  style={[
                    styles.attemptDot,
                    {
                      backgroundColor: attempt.isCorrect 
                        ? Colors.light.success + '40'
                        : Colors.light.destructive + '40'
                    }
                  ]}
                >
                  <Text style={[
                    styles.attemptDotText,
                    {
                      color: attempt.isCorrect 
                        ? Colors.light.success
                        : Colors.light.destructive
                    }
                  ]}>
                    {attempt.isCorrect ? '✓' : '✗'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Card>
    );
  };

  const renderDueItem = ({ item }: { item: HistoryItem }) => (
    <Card style={[styles.historyCard, styles.dueCard]}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionText} numberOfLines={2}>
          {item.question}
        </Text>
        <Badge variant="secondary" style={styles.dueBadge}>
          Due
        </Badge>
      </View>
      
      <View style={styles.dueItemFooter}>
        <View style={styles.questionMeta}>
          <Text style={styles.metaText}>{item.subject}</Text>
          <Text style={styles.metaText}>•</Text>
          <Text style={styles.metaText}>{item.subtopic}</Text>
        </View>
        
        <Button
          title="🔄 Review"
          variant="outline"
          size="sm"
          onPress={() => {}}
        />
      </View>
    </Card>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'recent':
        return (
          <FlatList
            data={recentlyPracticed}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      
      case 'due':
        if (dueToday.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>✅</Text>
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptyDescription}>
                  No questions are due for review today. Great job!
                </Text>
              </Card>
            </View>
          );
        }
        
        return (
          <FlatList
            data={dueToday}
            renderItem={renderDueItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      
      case 'analytics':
        return (
          <ScrollView contentContainerStyle={styles.analyticsContent}>
            {/* Subject Performance */}
            <Card style={styles.analyticsCard}>
              <View style={styles.analyticsHeader}>
                <Text style={styles.analyticsIcon}>📈</Text>
                <Text style={styles.analyticsTitle}>Subject Performance</Text>
              </View>
              
              <View style={styles.subjectPerformance}>
                {['Polity', 'History', 'Geography', 'Economy'].map((subject) => {
                  const subjectItems = mockHistory.filter(item => item.subject === subject);
                  const subjectAccuracy = subjectItems.length > 0 
                    ? Math.round(subjectItems.reduce((sum, item) => {
                        const correct = item.attempts.filter(a => a.isCorrect).length;
                        return sum + (correct / item.attempts.length);
                      }, 0) / subjectItems.length * 100)
                    : 0;
                  
                  return (
                    <View key={subject} style={styles.subjectRow}>
                      <View style={styles.subjectInfo}>
                        <Text style={styles.subjectName}>{subject}</Text>
                        <Text style={styles.subjectAccuracy}>{subjectAccuracy}%</Text>
                      </View>
                      <Progress value={subjectAccuracy} height={8} style={styles.subjectProgress} />
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Difficulty Analysis */}
            <Card style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Difficulty Analysis</Text>
              
              <View style={styles.difficultyGrid}>
                {['easy', 'medium', 'hard'].map((difficulty) => {
                  const difficultyItems = mockHistory.filter(item => item.difficulty === difficulty);
                  const count = difficultyItems.length;
                  
                  return (
                    <View key={difficulty} style={styles.difficultyItem}>
                      <View style={[
                        styles.difficultyCircle,
                        { backgroundColor: getDifficultyColor(difficulty) + '20' }
                      ]}>
                        <Text style={[
                          styles.difficultyCount,
                          { color: getDifficultyColor(difficulty) }
                        ]}>
                          {count}
                        </Text>
                      </View>
                      <Text style={styles.difficultyLabel}>{difficulty}</Text>
                      <Text style={styles.difficultySubLabel}>questions</Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Study Pattern */}
            <Card style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>Study Pattern</Text>
              
              <View style={styles.studyStats}>
                <View style={styles.studyStat}>
                  <Text style={styles.studyStatLabel}>Current streak</Text>
                  <Badge variant="secondary">12 days</Badge>
                </View>
                <View style={styles.studyStat}>
                  <Text style={styles.studyStatLabel}>Longest streak</Text>
                  <Badge variant="secondary">28 days</Badge>
                </View>
                <View style={styles.studyStat}>
                  <Text style={styles.studyStatLabel}>Average session length</Text>
                  <Badge variant="secondary">23 questions</Badge>
                </View>
                <View style={styles.studyStat}>
                  <Text style={styles.studyStatLabel}>Total time practiced</Text>
                  <Badge variant="secondary">42 hours</Badge>
                </View>
              </View>
            </Card>
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Question History</Text>
          <Text style={styles.subtitle}>Track your practice progress</Text>
        </View>
      </View>

      {/* Stats Overview */}
      <Card style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.light.primary }]}>
              {stats.totalAttempts}
            </Text>
            <Text style={styles.statLabel}>Total Attempts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.light.success }]}>
              {stats.accuracy}%
            </Text>
            <Text style={styles.statLabel}>Overall Accuracy</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.light.warning }]}>
              {dueToday.length}
            </Text>
            <Text style={styles.statLabel}>Due Today</Text>
          </View>
        </View>
      </Card>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {[
            { key: 'recent', label: 'Recent' },
            { key: 'due', label: 'Due Today' },
            { key: 'analytics', label: 'Analytics' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.light.foreground,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  statsCard: {
    margin: 24,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  tabsContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.light.muted,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.light.background,
  },
  tabText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  activeTabText: {
    color: Colors.light.foreground,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  historyCard: {
    marginBottom: 16,
    padding: 16,
  },
  dueCard: {
    borderColor: Colors.light.warning + '40',
    backgroundColor: Colors.light.warning + '10',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.foreground,
    lineHeight: 20,
    marginRight: 12,
  },
  difficultyBadge: {
    fontSize: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dueBadge: {
    backgroundColor: Colors.light.warning + '20',
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  questionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resultIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultIcon: {
    fontSize: 16,
  },
  accuracyText: {
    fontSize: 14,
    color: Colors.light.foreground,
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeIcon: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  reviewBadge: {
    fontSize: 12,
  },
  attemptHistory: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  attemptHistoryLabel: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    marginBottom: 8,
  },
  attemptDots: {
    flexDirection: 'row',
    gap: 4,
  },
  attemptDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attemptDotText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dueItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
  },
  analyticsContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  analyticsCard: {
    marginBottom: 24,
  },
  analyticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  analyticsIcon: {
    fontSize: 20,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 16,
  },
  subjectPerformance: {
    gap: 16,
  },
  subjectRow: {
    gap: 8,
  },
  subjectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  subjectAccuracy: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  subjectProgress: {
    height: 8,
  },
  difficultyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  difficultyItem: {
    alignItems: 'center',
  },
  difficultyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  difficultyCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.foreground,
    textTransform: 'capitalize',
  },
  difficultySubLabel: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  studyStats: {
    gap: 16,
  },
  studyStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studyStatLabel: {
    fontSize: 14,
    color: Colors.light.foreground,
  },
});