import React, { useState } from 'react';
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
import { Badge } from './ui/Badge';
import { Colors } from '../constants/Colors';
import { Subject, SubTopic, YearRange } from '../types';

interface SubTopicSelectionProps {
  subject: Subject;
  yearRanges: YearRange[];
  onStartSession: (subject: Subject, subtopics: SubTopic[], yearRanges: YearRange[], mode: 'timed' | 'untimed') => void;
  onBack: () => void;
}

export const SubTopicSelection: React.FC<SubTopicSelectionProps> = ({
  subject,
  yearRanges,
  onStartSession,
  onBack
}) => {
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [selectedYearRanges, setSelectedYearRanges] = useState<string[]>([]);
  const [mode, setMode] = useState<'timed' | 'untimed'>('untimed');

  const toggleSubtopic = (subtopicId: string) => {
    setSelectedSubtopics(prev =>
      prev.includes(subtopicId)
        ? prev.filter(id => id !== subtopicId)
        : [...prev, subtopicId]
    );
  };

  const toggleYearRange = (rangeId: string) => {
    setSelectedYearRanges(prev =>
      prev.includes(rangeId)
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  const selectAllSubtopics = () => {
    if (selectedSubtopics.length === subject.subtopics.length) {
      setSelectedSubtopics([]);
    } else {
      setSelectedSubtopics(subject.subtopics.map(st => st.id));
    }
  };

  const selectAllYearRanges = () => {
    if (selectedYearRanges.length === yearRanges.length) {
      setSelectedYearRanges([]);
    } else {
      setSelectedYearRanges(yearRanges.map(yr => yr.id));
    }
  };

  const canStart = selectedSubtopics.length > 0 && selectedYearRanges.length > 0;

  const selectedSubtopicsData = subject.subtopics.filter(st => selectedSubtopics.includes(st.id));
  const selectedYearRangesData = yearRanges.filter(yr => selectedYearRanges.includes(yr.id));
  const estimatedQuestions = selectedYearRangesData.reduce((sum, yr) => sum + yr.questionCount, 0) * 
    (selectedSubtopics.length / subject.subtopics.length) * 0.3;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.subjectIcon}>
              <Text style={styles.subjectEmoji}>{subject.icon}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{subject.name}</Text>
              <Text style={styles.subtitle}>Configure your practice session</Text>
            </View>
          </View>
        </View>

        {/* Subtopics Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Subtopics</Text>
            <Button
              title={selectedSubtopics.length === subject.subtopics.length ? 'Deselect All' : 'Select All'}
              variant="ghost"
              size="sm"
              onPress={selectAllSubtopics}
            />
          </View>

          <View style={styles.subtopicsList}>
            {subject.subtopics.map((subtopic) => (
              <TouchableOpacity
                key={subtopic.id}
                style={[
                  styles.subtopicItem,
                  selectedSubtopics.includes(subtopic.id) && styles.selectedSubtopic
                ]}
                onPress={() => toggleSubtopic(subtopic.id)}
              >
                <View style={styles.checkbox}>
                  {selectedSubtopics.includes(subtopic.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <View style={styles.subtopicInfo}>
                  <View style={styles.subtopicHeader}>
                    <Text style={styles.subtopicName}>{subtopic.name}</Text>
                    <View style={styles.subtopicStats}>
                      <Text style={styles.progressText}>{subtopic.progress}%</Text>
                      {subtopic.pendingCount > 0 && (
                        <Badge variant="secondary" style={styles.pendingBadge}>
                          {subtopic.pendingCount} pending
                        </Badge>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Year Range Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Year Range</Text>
            <Button
              title={selectedYearRanges.length === yearRanges.length ? 'Deselect All' : 'Select All'}
              variant="ghost"
              size="sm"
              onPress={selectAllYearRanges}
            />
          </View>

          <View style={styles.yearRangesContainer}>
            {yearRanges.map((range) => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.yearRangeChip,
                  selectedYearRanges.includes(range.id) && styles.selectedYearRange
                ]}
                onPress={() => toggleYearRange(range.id)}
              >
                <Text style={[
                  styles.yearRangeLabel,
                  selectedYearRanges.includes(range.id) && styles.selectedYearRangeText
                ]}>
                  {range.label}
                </Text>
                <Text style={[
                  styles.yearRangeCount,
                  selectedYearRanges.includes(range.id) && styles.selectedYearRangeText
                ]}>
                  ({range.questionCount})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Mode</Text>
          
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[
                styles.modeOption,
                mode === 'untimed' && styles.selectedMode
              ]}
              onPress={() => setMode('untimed')}
            >
              <View style={styles.modeIcon}>
                <Text style={styles.modeEmoji}>⚡</Text>
              </View>
              <View style={styles.modeText}>
                <Text style={styles.modeTitle}>Untimed</Text>
                <Text style={styles.modeDescription}>Focus on accuracy</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeOption,
                mode === 'timed' && styles.selectedMode
              ]}
              onPress={() => setMode('timed')}
            >
              <View style={styles.modeIcon}>
                <Text style={styles.modeEmoji}>⏰</Text>
              </View>
              <View style={styles.modeText}>
                <Text style={styles.modeTitle}>Timed</Text>
                <Text style={styles.modeDescription}>2 min per question</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Session Summary */}
        {canStart && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Session Preview</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtopics selected:</Text>
                <Text style={styles.summaryValue}>{selectedSubtopics.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Year ranges:</Text>
                <Text style={styles.summaryValue}>{selectedYearRanges.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimated questions:</Text>
                <Text style={styles.summaryValue}>~{Math.round(estimatedQuestions)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mode:</Text>
                <Text style={styles.summaryValue}>{mode}</Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Start Button */}
      <View style={styles.bottomSection}>
        <Button
          title={canStart 
            ? `Start Practice (${Math.round(estimatedQuestions)} Qs)` 
            : 'Select subtopics and year range'
          }
          onPress={() => onStartSession(subject, selectedSubtopicsData, selectedYearRangesData, mode)}
          disabled={!canStart}
          style={styles.startButton}
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
    paddingBottom: 100,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subjectEmoji: {
    fontSize: 16,
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
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionHeader: {
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
  subtopicsList: {
    gap: 12,
  },
  subtopicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedSubtopic: {
    backgroundColor: Colors.light.primary + '10',
    borderColor: Colors.light.primary + '40',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.light.primary,
  },
  subtopicInfo: {
    flex: 1,
  },
  subtopicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtopicName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
    flex: 1,
  },
  subtopicStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  pendingBadge: {
    fontSize: 12,
  },
  yearRangesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  yearRangeChip: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  selectedYearRange: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  yearRangeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  yearRangeCount: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    marginTop: 2,
  },
  selectedYearRangeText: {
    color: Colors.light.primaryForeground,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeOption: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  selectedMode: {
    backgroundColor: Colors.light.primary + '10',
    borderColor: Colors.light.primary + '40',
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeEmoji: {
    fontSize: 20,
  },
  modeText: {
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: Colors.light.accent + '80',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  startButton: {
    height: 48,
  },
});