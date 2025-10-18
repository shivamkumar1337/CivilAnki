// components/TopicOptions.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';
import { Colors } from '../constants/Colors';

type TopicOptionsRouteProp = RouteProp<MainStackParamList, 'TopicOptions'>;
type TopicOptionsNavigationProp = StackNavigationProp<MainStackParamList, 'TopicOptions'>;

const YEAR_RANGES = [
  { id: 'all', label: 'All Years', value: null },
  { id: '2020-2024', label: '2020-2024', value: { start: 2020, end: 2024 } },
  { id: '2015-2019', label: '2015-2019', value: { start: 2015, end: 2019 } },
  { id: '2010-2014', label: '2010-2014', value: { start: 2010, end: 2014 } },
  { id: '2005-2009', label: '2005-2009', value: { start: 2005, end: 2009 } },
];

const STUDY_OPTIONS = [
  { id: 'unattempted', label: 'New Questions', icon: '✨', color: Colors.light.primary },
  { id: 'due', label: 'Due for Review', icon: '⚡', color: Colors.light.warning },
  { id: 'learning', label: 'Learning', icon: '📚', color: Colors.light.warning },
  { id: 'review', label: 'Review', icon: '🔄', color: Colors.light.success },
  { id: 'all', label: 'All Questions', icon: '📝', color: Colors.light.mutedForeground },
];

export const TopicOptions: React.FC = () => {
  const navigation = useNavigation<TopicOptionsNavigationProp>();
  const route = useRoute<TopicOptionsRouteProp>();
  const { subject, subTopic } = route.params;

  const [selectedYearRange, setSelectedYearRange] = useState(YEAR_RANGES[0]);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const handleStudyOptionPress = (option: typeof STUDY_OPTIONS[0]) => {
    const params: any = {
      status: option.id,
      subject_id: subject.id,
      topic_id: subTopic.id,
      limit: 20
    };

    // Add year filter if selected
    if (selectedYearRange.value) {
      params.year_start = selectedYearRange.value.start;
      params.year_end = selectedYearRange.value.end;
    }

    navigation.navigate('QuestionScreen', {
      subject,
      subTopic,
      questionParams: params
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{subTopic.name}</Text>
          <Text style={styles.headerSubtitle}>{subject.name}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Year Range Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Year Range</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowYearDropdown(true)}
          >
            <Text style={styles.dropdownText}>{selectedYearRange.label}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.light.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Study Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Mode</Text>
          <View style={styles.studyOptionsGrid}>
            {STUDY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.studyOptionCard}
                onPress={() => handleStudyOptionPress(option)}
              >
                <View style={[styles.studyOptionIcon, { backgroundColor: option.color + '15' }]}>
                  <Text style={styles.studyOptionEmoji}>{option.icon}</Text>
                </View>
                <Text style={styles.studyOptionLabel}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.light.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Year Range Modal */}
      <Modal
        visible={showYearDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowYearDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Year Range</Text>
            {YEAR_RANGES.map((range) => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.modalOption,
                  selectedYearRange.id === range.id && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setSelectedYearRange(range);
                  setShowYearDropdown(false);
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedYearRange.id === range.id && styles.modalOptionTextSelected
                ]}>
                  {range.label}
                </Text>
                {selectedYearRange.id === range.id && (
                  <Ionicons name="checkmark" size={20} color={Colors.light.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.foreground,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
  },
  dropdownText: {
    fontSize: 15,
    color: Colors.light.foreground,
    fontWeight: '500',
  },
  studyOptionsGrid: {
    gap: 12,
  },
  studyOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
  },
  studyOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studyOptionEmoji: {
    fontSize: 18,
  },
  studyOptionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  modalOptionSelected: {
    backgroundColor: Colors.light.accent,
  },
  modalOptionText: {
    fontSize: 15,
    color: Colors.light.foreground,
  },
  modalOptionTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});