import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Card } from '../ui/Card';

interface ProgressOverviewProps {
  overallProgress: number;
  totalMastered: number;
  totalQuestions: number;
  todayCompleted: number;
  todayTarget: number;
  onViewDetails: () => void;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  overallProgress,
  totalMastered,
  totalQuestions,
  todayCompleted,
  todayTarget,
  onViewDetails,
}) => {
  const todayProgress = todayTarget > 0 ? (todayCompleted / todayTarget) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <TouchableOpacity onPress={onViewDetails}>
          <Ionicons name="chevron-forward" size={20} color={Colors.light.mutedForeground} />
        </TouchableOpacity>
      </View>

      <Card style={styles.progressCard}>
        <View style={styles.mainProgress}>
          <View style={styles.circularProgress}>
            <LinearGradient
              colors={[Colors.light.primary, '#1D4ED8']}
              style={styles.progressRing}
            >
              <View style={styles.progressInner}>
                <Text style={styles.progressPercentage}>{Math.round(overallProgress)}%</Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </LinearGradient>
          </View>
          
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalMastered}</Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalQuestions - totalMastered}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        <View style={styles.todayProgress}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Today's Goal</Text>
            <Text style={styles.todayCount}>{todayCompleted}/{todayTarget}</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${Math.min(todayProgress, 100)}%` }]}
            />
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.foreground,
  },
  progressCard: {
    padding: 20,
  },
  mainProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  circularProgress: {
    marginRight: 20,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.foreground,
  },
  progressLabel: {
    fontSize: 10,
    color: Colors.light.mutedForeground,
  },
  progressStats: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.foreground,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.light.border,
  },
  todayProgress: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 16,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.foreground,
  },
  todayCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.muted,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
});