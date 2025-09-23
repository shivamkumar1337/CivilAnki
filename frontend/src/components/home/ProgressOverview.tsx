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
      console.log('Loaded progress stats:', progressStats);
      setStats(progressStats);
    } catch (error) {
      console.error('Error loading progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const overallProgressPercentage = stats.totalQuestions > 0
    ? (stats.totalMastered / stats.totalQuestions) * 100
    : 0;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.overallCard}>
        <View style={styles.overallHeader}>
          <Text style={styles.overallTitle}>Overall Progress</Text>
          <TouchableOpacity onPress={onViewDetails} style={styles.detailsButton}>
            <Text style={styles.detailsText}>Details</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.overallContent}>
          <View style={styles.circularProgress}>
            <View style={styles.progressCircle}>
              {/* Background circle */}
              <View style={styles.progressBackground} />
              
              {/* Progress arc */}
              <View style={[
                styles.progressArc,
                { 
                  transform: [
                    { rotate: '-90deg' }, // Start from top
                    { rotateY: overallProgressPercentage > 50 ? '0deg' : '180deg' }
                  ]
                }
              ]}>
                <View style={[
                  styles.progressFill,
                  {
                    transform: [
                      { rotate: `${Math.min(overallProgressPercentage * 3.6, 180)}deg` }
                    ]
                  }
                ]} />
                {overallProgressPercentage > 50 && (
                  <View style={[
                    styles.progressFill,
                    styles.progressFillSecond,
                    {
                      transform: [
                        { rotate: `${Math.min((overallProgressPercentage - 50) * 3.6, 180)}deg` }
                      ]
                    }
                  ]} />
                )}
              </View>
              
              {/* Center content */}
              <View style={styles.progressCenter}>
                <Text style={styles.progressNumber}>{Math.round(overallProgressPercentage)}%</Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalMastered}</Text>
                <Text style={styles.statLabel}>Mastered</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalQuestions}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
            
            {/* Additional stats row */}
            <View style={styles.additionalStats}>
              <View style={styles.miniStat}>
                <Ionicons name="add-circle" size={14} color={Colors.light.primary} />
                <Text style={styles.miniStatText}>{stats.new || 0} New</Text>
              </View>
              <View style={styles.miniStat}>
                <Ionicons name="time" size={14} color={Colors.light.warning} />
                <Text style={styles.miniStatText}>{stats.due || 0} Due</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  loadingCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  loadingIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.muted,
    marginBottom: 12,
  },
  loadingText: {
    color: Colors.light.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
  },
  overallCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.05,
    // shadowRadius: 8,
    // elevation: 2,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  overallTitle: {
    color: Colors.light.foreground,
    fontSize: 16,
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailsText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  overallContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circularProgress: {
    marginRight: 20,
  },
  progressCircle: {
    width: 80,
    height: 80,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: Colors.light.muted,
  },
  progressArc: {
    position: 'absolute',
    width: 80,
    height: 80,
  },
  progressFill: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: Colors.light.primary,
    borderRightColor: Colors.light.primary,
  },
  progressFillSecond: {
    position: 'absolute',
    borderTopColor: Colors.light.primary,
    borderLeftColor: Colors.light.primary,
    borderRightColor: 'transparent',
  },
  progressCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  progressNumber: {
    color: Colors.light.foreground,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  progressLabel: {
    color: Colors.light.mutedForeground,
    fontSize: 10,
    fontWeight: '500',
  },
  statsContainer: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: Colors.light.foreground,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.light.mutedForeground,
    fontSize: 11,
    fontWeight: '500',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniStatText: {
    fontSize: 11,
    color: Colors.light.mutedForeground,
    fontWeight: '500',
  },
});