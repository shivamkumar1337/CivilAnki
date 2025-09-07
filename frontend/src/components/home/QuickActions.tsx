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
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionCard}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={action.gradient}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionContent}>
                <Ionicons 
                  name={action.icon} 
                  size={32} 
                  color={Colors.light.primaryForeground} 
                />
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
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