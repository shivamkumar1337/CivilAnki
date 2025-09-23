import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  onPress: () => void;
}

interface QuickActionsProps {
  onStartPractice: () => void;
  onReviewMissed: () => void;
  onViewProgress: () => void;
  onTakeTest: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onStartPractice,
  onReviewMissed,
  onViewProgress,
  onTakeTest,
}) => {
  const actions: QuickAction[] = [
    {
      id: 'practice',
      title: 'Start Practice',
      subtitle: 'Begin your daily revision',
      icon: 'play-circle',
      gradient: [Colors.light.primary, '#0066CC'],
      onPress: onStartPractice,
    },
    {
      id: 'review',
      title: 'Review Missed',
      subtitle: 'Revisit incorrect answers',
      icon: 'refresh-circle',
      gradient: [Colors.light.warning, '#E67E00'],
      onPress: onReviewMissed,
    },
    {
      id: 'progress',
      title: 'View Progress',
      subtitle: 'Track your improvement',
      icon: 'analytics',
      gradient: [Colors.light.success, '#0E6B0E'],
      onPress: onViewProgress,
    },
    {
      id: 'test',
      title: 'Take Test',
      subtitle: 'Full length mock test',
      icon: 'document-text',
      gradient: ['#6B46C1', '#553C9A'],
      onPress: onTakeTest,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Quick Actions */}
              <View style={styles.quickActions}>
                <Text style={styles.quickActionsTitle}>Quick Start</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.dueButton]}
                    onPress={() => handleQuickAction('due')}
                  >
                    <Ionicons name="flash" size={16} color={Colors.light.warning} />
                    <Text style={styles.actionButtonText}>Due</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.newButton]}
                    onPress={() => handleQuickAction('unattempted')}
                  >
                    <Ionicons name="add-circle" size={16} color={Colors.light.primary} />
                    <Text style={styles.actionButtonText}>New</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.reviewButton]}
                    onPress={() => handleQuickAction('review')}
                  >
                    <Ionicons name="refresh" size={16} color={Colors.light.success} />
                    <Text style={styles.actionButtonText}>Review</Text>
                  </TouchableOpacity>
                </View>
              </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
  },
  actionContent: {
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primaryForeground,
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.light.primaryForeground + 'CC',
    marginTop: 4,
    textAlign: 'center',
  },
});