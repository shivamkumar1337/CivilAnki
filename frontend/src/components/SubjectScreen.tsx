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

  const handleStudyOption = (status: string) => {
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
    navigation.navigate('TopicOptions', {
      subject,
      subTopic
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
            {stats.total} questions • {subTopics.length} topics
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Study Options */}
        <View style={styles.quickStudySection}>
          <Text style={styles.sectionTitle}>Quick Study</Text>
          <View style={styles.quickStudyGrid}>
            {stats.due > 0 && (
              <TouchableOpacity 
                style={[styles.quickStudyCard, styles.dueCard]}
                onPress={() => handleStudyOption('due')}
              >
                <Text style={styles.quickStudyIcon}>⚡</Text>
                <Text style={styles.quickStudyNumber}>{stats.due}</Text>
                <Text style={styles.quickStudyLabel}>Due</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.quickStudyCard}
              onPress={() => handleStudyOption('unattempted')}
            >
              <Text style={styles.quickStudyIcon}>✨</Text>
              <Text style={styles.quickStudyNumber}>{stats.new}</Text>
              <Text style={styles.quickStudyLabel}>New</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickStudyCard}
              onPress={() => handleStudyOption('review')}
            >
              <Text style={styles.quickStudyIcon}>🔄</Text>
              <Text style={styles.quickStudyNumber}>{stats.review}</Text>
              <Text style={styles.quickStudyLabel}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Topics */}
        <View style={styles.topicsSection}>
          <Text style={styles.sectionTitle}>Topics</Text>
          {subTopics.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicCard}
              onPress={() => handleTopicPress(topic)}
            >
              <View style={styles.topicContent}>
                <Text style={styles.topicName}>{topic.name}</Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={18} 
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
    backgroundColor: Colors.light.background,
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
  quickStudySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 12,
  },
  quickStudyGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStudyCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dueCard: {
    backgroundColor: Colors.light.warning + '15',
    borderColor: Colors.light.warning + '30',
  },
  quickStudyIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  quickStudyNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  quickStudyLabel: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    fontWeight: '500',
  },
  topicsSection: {
    padding: 16,
  },
  topicCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
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
  topicName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
});