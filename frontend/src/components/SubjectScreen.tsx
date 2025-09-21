// components/SubjectScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';
import { Colors } from '../constants/Colors';
import { HomeService } from '../services/HomeService';
import { Subject, SubTopic, ProgressStats } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

type SubjectScreenRouteProp = RouteProp<MainStackParamList, 'SubjectScreen'>;
type SubjectScreenNavigationProp = StackNavigationProp<MainStackParamList, 'SubjectScreen'>;

export const SubjectScreen: React.FC = () => {
  const navigation = useNavigation<SubjectScreenNavigationProp>();
  const route = useRoute<SubjectScreenRouteProp>();
  const { subject } = route.params;

  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProgressStats>({
    new: 0,
    learning: 0,
    review: 0,
    due: 0,
    today: 0,
    total: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [topicsResponse, statsResponse] = await Promise.all([
          HomeService.getTopics(subject.id),
          HomeService.getProgress({ subject_id: subject.id, status: 'all', limit: 1000 })
        ]);

        setSubTopics(topicsResponse);
        
        // Calculate stats from the response
        const questions = statsResponse.questions || [];
        const newStats = {
          new: questions.filter((q: any) => q.card_type === 'new' || !q.card_type).length,
          learning: questions.filter((q: any) => q.card_type === 'learning').length,
          review: questions.filter((q: any) => q.card_type === 'review').length,
          due: questions.filter((q: any) => {
            if (!q.next_review_at) return false;
            return new Date(q.next_review_at) <= new Date();
          }).length,
          today: questions.filter((q: any) => {
            if (!q.next_review_at) return false;
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            return new Date(q.next_review_at) <= today;
          }).length,
          total: questions.length
        };
        setStats(newStats);

      } catch (error) {
        console.error('Error fetching subject data:', error);
        setError('Failed to load subject data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subject.id]);

  const handleStudyOption = (status: string, title: string) => {
    navigation.navigate('QuestionScreen', {
      subject,
      questionParams: { 
        status, 
        subject_id: subject.id,
        limit: 20 
      }
    });
  };

  const handleTopicPress = (subTopic: SubTopic) => {
    navigation.navigate('QuestionScreen', {
      subject,
      subTopic,
      questionParams: {
        status: 'due',
        subject_id: subject.id,
        topic_id: subTopic.id,
        limit: 20
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subject.name}</Text>
        </View>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subject.name}</Text>
        </View>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.light.foreground} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{subject.name}</Text>
          <Text style={styles.headerSubtitle}>
            {stats.total} total questions • {subTopics.length} topics
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Study Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Options</Text>
          
          {stats.due > 0 && (
            <TouchableOpacity 
              style={[styles.studyCard, styles.dueCard]}
              onPress={() => handleStudyOption('due', 'Due for Review')}
            >
              <View style={styles.studyCardContent}>
                <View style={styles.studyCardLeft}>
                  <Text style={styles.studyCardIcon}>⚡</Text>
                  <View>
                    <Text style={styles.studyCardTitle}>Due for Review</Text>
                    <Text style={styles.studyCardSubtitle}>
                      {stats.due} questions ready
                    </Text>
                  </View>
                </View>
                <Badge style={styles.dueBadge}>
                  <Text style={styles.dueBadgeText}>{stats.due}</Text>
                </Badge>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.studyGrid}>
            <TouchableOpacity 
              style={styles.studyGridCard}
              onPress={() => handleStudyOption('unattempted', 'Learn New')}
            >
              <Text style={styles.studyGridIcon}>✨</Text>
              <Text style={styles.studyGridNumber}>{stats.new}</Text>
              <Text style={styles.studyGridLabel}>New</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.studyGridCard}
              onPress={() => handleStudyOption('learning', 'Continue Learning')}
            >
              <Text style={styles.studyGridIcon}>📚</Text>
              <Text style={styles.studyGridNumber}>{stats.learning}</Text>
              <Text style={styles.studyGridLabel}>Learning</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.studyGridCard}
              onPress={() => handleStudyOption('review', 'Review')}
            >
              <Text style={styles.studyGridIcon}>🔄</Text>
              <Text style={styles.studyGridNumber}>{stats.review}</Text>
              <Text style={styles.studyGridLabel}>Review</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.studyGridCard}
              onPress={() => handleStudyOption('today', 'Today\'s Cards')}
            >
              <Text style={styles.studyGridIcon}>📅</Text>
              <Text style={styles.studyGridNumber}>{stats.today}</Text>
              <Text style={styles.studyGridLabel}>Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Topics</Text>
          {subTopics.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicCard}
              onPress={() => handleTopicPress(topic)}
            >
              <View style={styles.topicContent}>
                <View style={styles.topicLeft}>
                  <Text style={styles.topicName}>{topic.name}</Text>
                  <Text style={styles.topicMeta}>
                    Topic {topic.id} • {subject.name}
                  </Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={Colors.light.mutedForeground} 
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    backgroundColor: Colors.light.card,
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.foreground,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.mutedForeground,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 16,
  },
  studyCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dueCard: {
    backgroundColor: Colors.light.warning + '10',
    borderColor: Colors.light.warning + '30',
  },
  studyCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studyCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  studyCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 2,
  },
  studyCardSubtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  dueBadge: {
    backgroundColor: Colors.light.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dueBadgeText: {
    color: Colors.light.primaryForeground,
    fontWeight: '600',
  },
  studyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  studyGridCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  studyGridIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  studyGridNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  studyGridLabel: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    fontWeight: '500',
  },
  topicCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  topicContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicLeft: {
    flex: 1,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  topicMeta: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
});