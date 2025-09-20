// src/components/home/ProgressOverview.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/Colors';
import { HomeService, ProgressStats } from '@/src/services/HomeService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@/src/navigation/types';

type HomeNavigationProp = StackNavigationProp<MainStackParamList, 'HomeTabs'>;

interface ProgressOverviewProps {
  onViewDetails: () => void;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({ onViewDetails }) => {
  const navigation = useNavigation<HomeNavigationProp>();
  const [stats, setStats] = useState<ProgressStats>({
    overallProgress: 0,
    totalMastered: 0,
    totalQuestions: 0,
    todayCompleted: 0,
    todayTarget: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressStats();
  }, []);

  const loadProgressStats = async () => {
    try {
      setLoading(true);
      const progressStats = await HomeService.getProgressStats();
      setStats(progressStats);
    } catch (error) {
      console.error('Error loading progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTodayGoalPress = () => {
    navigation.navigate('QuestionScreen', {
      questionParams: {
        status: 'today'
      }
    });
  };

  const todayProgressPercentage = stats.todayTarget > 0 
    ? (stats.todayCompleted / stats.todayTarget) * 100 
    : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Targets</Text>
          <TouchableOpacity onPress={onViewDetails} style={styles.headerButton}>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Today's Goal Section - NOW AT TOP */}
        <TouchableOpacity 
          style={styles.todaySection}
          onPress={handleTodayGoalPress}
          activeOpacity={0.7}
        >
          <View style={styles.todayHeader}>
            <Text style={styles.todayTitle}>Today</Text>
            <View style={styles.todayStats}>
              <Text style={styles.todayText}>
                {stats.todayCompleted}/{stats.todayTarget}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.light.mutedForeground} />
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${Math.min(todayProgressPercentage, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.todayPercentage}>
              {Math.round(todayProgressPercentage)}%
            </Text>
          </View>
        </TouchableOpacity>

        {/* Overall Progress Section - NOW AT BOTTOM */}
        <View style={styles.overallSection}>
          <View style={styles.progressRow}>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressNumber}>{stats.overallProgress}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalMastered}</Text>
                <Text style={styles.statLabel}>Mastered</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalQuestions}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  loadingCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  loadingText: {
    color: Colors.light.mutedForeground,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: Colors.light.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    padding: 2,
  },
  // Today's Section - Updated styles for top position
  todaySection: {
    marginBottom: 16, // Changed from paddingTop to marginBottom
    paddingBottom: 12, // Added padding bottom
    borderBottomWidth: 1, // Changed from borderTop to borderBottom
    borderBottomColor: Colors.light.border,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayTitle: {
    color: Colors.light.foreground,
    fontSize: 14,
    fontWeight: '600',
  },
  todayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  todayText: {
    color: Colors.light.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.light.muted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  todayPercentage: {
    color: Colors.light.foreground,
    fontSize: 12,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'right',
  },
  // Overall Section - Updated styles for bottom position
  overallSection: {
    // Removed marginBottom since it's now at the bottom
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTextContainer: {
    alignItems: 'flex-start',
  },
  progressNumber: {
    color: Colors.light.foreground,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  progressLabel: {
    color: Colors.light.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: Colors.light.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    color: Colors.light.mutedForeground,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16,
  },
});
