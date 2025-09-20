// components/SubjectScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../navigation/types';
import { SubTopic } from '../types';
import { Colors } from '../constants/Colors';
import { HomeService } from '../services/HomeService';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type SubjectScreenRouteProp = RouteProp<MainStackParamList, 'SubjectScreen'>;
type SubjectScreenNavigationProp = StackNavigationProp<MainStackParamList, 'SubjectScreen'>;

export const SubjectScreen: React.FC = () => {
  const navigation = useNavigation<SubjectScreenNavigationProp>();
  const route = useRoute<SubjectScreenRouteProp>();
  const { subject } = route.params;
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubTopics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await HomeService.getTopics(subject.id);
        const transformedSubTopics = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          subject_id: item.subject_id,
          created_at: item.created_at,
        }));
        setSubTopics(transformedSubTopics);
      } catch (err) {
        setError('Failed to load subtopics. Please try again.');
        setSubTopics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubTopics();
  }, [subject.id]);

  const handleSubTopicPress = (subTopic: SubTopic) => {
    navigation.navigate('QuestionScreen', { subject, subTopic });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    HomeService.getTopics(subject.id)
      .then((data) => {
        const transformedSubTopics = data.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          subject_id: item.subject_id,
          created_at: item.created_at,
        }));
        setSubTopics(transformedSubTopics);
      })
      .catch(() => {
        setError('Failed to load subtopics. Please try again.');
        setSubTopics([]);
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{subject.name}</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading subtopics...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{subject.name}</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{subject.name}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {subTopics.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No subtopics available.</Text>
          </View>
        ) : (
          subTopics.map((subTopic) => (
            <TouchableOpacity
              key={subTopic.id}
              style={styles.subTopicItem}
              onPress={() => handleSubTopicPress(subTopic)}
              activeOpacity={0.7}
            >
              <Text style={styles.subTopicName}>{subTopic.name}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.muted} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa', // soft light background for soothing effect
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // subtle border for definition
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50', // dark shade for strong but soft heading
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  subTopicItem: {
    backgroundColor: 'white',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },
  subTopicName: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  retryButton: {
    backgroundColor: '#2980b9',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
  },
});
