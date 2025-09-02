import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';
import { Colors } from '../constants/Colors';
import { User, Subject, Screen } from '../types';

interface HomeProps {
  user: User;
  subjects: Subject[];
  onNavigate: (screen: Screen) => void;
}

export const Home: React.FC<HomeProps> = ({ user, subjects, onNavigate }) => {
  const totalPendingToday = subjects.reduce((sum, subject) => sum + subject.pendingToday, 0);
  const overallProgress = subjects.reduce((sum, subject) => sum + subject.progress, 0) / subjects.length;
  const totalMastered = subjects.reduce((sum, subject) => sum + subject.masteredCount, 0);
  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.totalQuestions, 0);

  const lastPracticedSubject = subjects.find(s => s.progress > 0) || subjects[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.avatar}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>
                Welcome back, {user.name.split(' ')[0]}
              </Text>
              <Text style={styles.subtitle}>Ready to revise?</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <Badge variant="secondary" style={styles.streakBadge}>
              🔥 {user.streak} day streak
            </Badge>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => onNavigate('settings')}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Overview */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Overall Progress</Text>
            <TouchableOpacity onPress={() => onNavigate('history')}>
              <Text style={styles.historyIcon}>📊</Text>
            </TouchableOpacity>
          </View>
          
          {/* Circular Progress */}
          <View style={styles.circularProgressContainer}>
                        <View style={styles.circularProgress}>
              <Text style={styles.progressPercentage}>{Math.round(overallProgress)}%</Text>
            </View>
          </View>

          <View style={styles.progressStats}>
            <Text style={styles.masteredCount}>{totalMastered}</Text>
            <Text style={styles.masteredLabel}>of {totalQuestions} questions mastered</Text>
          </View>
        </Card>

        {/* Today's Tasks */}
        <Card style={styles.tasksCard}>
          <View style={styles.tasksHeader}>
            <View>
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
              <Text style={styles.pendingCount}>
                {totalPendingToday} questions pending
              </Text>
            </View>
            <Text style={styles.taskEmoji}>
              {totalPendingToday > 0 ? '📝' : '✅'}
            </Text>
          </View>

          <View style={styles.taskActions}>
            {totalPendingToday > 0 ? (
              <>
                <Button
                  title={`Start Today (${totalPendingToday} Qs)`}
                  onPress={() => onNavigate('subjects')}
                  style={styles.primaryAction}
                />
                <Button
                  title="Review Missed"
                  variant="outline"
                  onPress={() => onNavigate('history')}
                  style={styles.secondaryAction}
                />
              </>
            ) : (
              <>
                <View style={styles.completedMessage}>
                  <Text style={styles.completedTitle}>🎉 All caught up for today!</Text>
                  <Text style={styles.completedSubtitle}>Great job on completing your daily goals</Text>
                </View>
                <Button
                  title="Extra Practice"
                  variant="outline"
                  onPress={() => onNavigate('subjects')}
                  style={styles.secondaryAction}
                />
              </>
            )}
          </View>
        </Card>

        {/* Subject Progress */}
        <View style={styles.subjectsSection}>
          <View style={styles.subjectsHeader}>
            <Text style={styles.sectionTitle}>Subject Progress</Text>
            <TouchableOpacity onPress={() => onNavigate('subjects')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subjectsList}>
            {subjects.slice(0, 3).map((subject) => (
              <Card key={subject.id} style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectIcon}>{subject.icon}</Text>
                    <View style={styles.subjectDetails}>
                      <Text style={styles.subjectName}>{subject.name}</Text>
                      <Text style={styles.masteredText}>
                        {subject.masteredCount} mastered
                      </Text>
                    </View>
                  </View>
                  <View style={styles.subjectStats}>
                    <Text style={styles.progressText}>{subject.progress}%</Text>
                    {subject.pendingToday > 0 && (
                      <Badge variant="secondary" style={styles.pendingBadge}>
                        {subject.pendingToday} pending
                      </Badge>
                    )}
                  </View>
                </View>
                <Progress value={subject.progress} height={8} />
              </Card>
            ))}
          </View>
        </View>

        {/* Last Practiced */}
        <Card style={styles.lastPracticedCard}>
          <View style={styles.lastPracticedContent}>
            <View style={styles.lastPracticedInfo}>
              <Text style={styles.subjectIcon}>{lastPracticedSubject.icon}</Text>
              <View>
                <Text style={styles.lastPracticedLabel}>Last practiced</Text>
                <Text style={styles.lastPracticedSubject}>{lastPracticedSubject.name}</Text>
              </View>
            </View>
            <Button
              title="Continue"
              variant="outline"
              size="sm"
              onPress={() => onNavigate('subjects')}
            />
          </View>
        </Card>

        {/* Bottom CTA */}
        <Button
          title="Start Practice Session"
          onPress={() => onNavigate('subjects')}
          style={styles.bottomCTA}
        />
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
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 20,
  },
  progressCard: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  historyIcon: {
    fontSize: 16,
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circularProgress: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.muted,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.foreground,
  },
  progressStats: {
    alignItems: 'center',
  },
  masteredCount: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.foreground,
  },
  masteredLabel: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  tasksCard: {
    marginBottom: 24,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pendingCount: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  taskEmoji: {
    fontSize: 24,
  },
  taskActions: {
    gap: 12,
  },
  primaryAction: {
    height: 44,
  },
  secondaryAction: {
    height: 44,
  },
  completedMessage: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  completedTitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
  subjectsSection: {
    marginBottom: 24,
  },
  subjectsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  subjectsList: {
    gap: 12,
  },
  subjectCard: {
    padding: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  subjectDetails: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  masteredText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  subjectStats: {
    alignItems: 'flex-end',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  pendingBadge: {
    fontSize: 12,
  },
  lastPracticedCard: {
    marginBottom: 24,
  },
  lastPracticedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastPracticedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lastPracticedLabel: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  lastPracticedSubject: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  bottomCTA: {
    height: 48,
    marginTop: 8,
  },
});