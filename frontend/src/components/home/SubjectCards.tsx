import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Subject } from '../../types';
import { Card } from '../ui/Card';

interface SubjectCardsProps {
  subjects: Subject[];
  onSubjectPress: (subject: Subject) => void;
  onViewAll: () => void;
}

export const SubjectCards: React.FC<SubjectCardsProps> = ({
  subjects,
  onSubjectPress,
  onViewAll,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Continue Learning</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {subjects.slice(0, 5).map((subject) => (
          <TouchableOpacity
            key={subject.id}
            onPress={() => onSubjectPress(subject)}
            activeOpacity={0.8}
          >
            <Card style={styles.subjectCard}>
              <LinearGradient
                colors={[Colors.light.card, Colors.light.muted]}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.subjectIcon}>{subject.icon}</Text>
                  <View style={styles.progressBadge}>
                    <Text style={styles.progressText}>{subject.progress}%</Text>
                  </View>
                </View>
                
                <Text style={styles.subjectName}>{subject.name}</Text>
                
                <View style={styles.stats}>
                  <View style={styles.statRow}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.light.success} />
                    <Text style={styles.statText}>{subject.masteredCount} mastered</Text>
                  </View>
                  {subject.pendingToday > 0 && (
                    <View style={styles.statRow}>
                      <Ionicons name="time" size={14} color={Colors.light.warning} />
                      <Text style={styles.statText}>{subject.pendingToday} pending</Text>
                    </View>
                  )}
                </View>

                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${subject.progress}%` }]}
                  />
                </View>
              </LinearGradient>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.foreground,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  subjectCard: {
    width: 160,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    height: 140,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  subjectIcon: {
    fontSize: 24,
  },
  progressBadge: {
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 8,
  },
  stats: {
    gap: 4,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    marginLeft: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
});