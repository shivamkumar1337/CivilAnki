// src/screens/Home.tsx
import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import { MainStackParamList } from '@/src/navigation/types';
import { RootState, AppDispatch } from '@/src/store';
import { Header } from './Header';
import { ProgressOverview } from './ProgressOverview';
import { Colors } from '@/src/constants/Colors';
import { SubjectCards } from './SubjectCards';
import { fetchSubjects } from '@/src/store/slices/subjectsSlice';

type HomeNavigationProp = StackNavigationProp<MainStackParamList, 'HomeTabs'>;

export const Home: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { 
    staticSubjects, 
    currentSubjects, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.subjects);

  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Fetch subjects on component mount
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    console.log('Static subjects in Home:', staticSubjects);
    console.log('Current subjects in Home:', currentSubjects);
  }, [staticSubjects, currentSubjects]);

  const handleSubjectPress = (subject: any) => {
    console.log('Subject pressed:', subject);
    navigation.navigate('SubTopics', { subject });
  };

  const handleViewAllSubjects = () => {
    navigation.navigate('Subjects');
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary || '#2563eb'} />
          <Text style={styles.loadingText}>Loading subjects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Header 
          onNotificationPress={() => {}} 
        />
        
        <ProgressOverview
          overallProgress={75} // Mock data for now
          totalMastered={150}
          totalQuestions={200}
          todayCompleted={10}
          todayTarget={15}
          onViewDetails={() => {}}
        />
        
        {/* Static Subjects Section */}
        {staticSubjects.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Static</Text>
              <Text style={styles.sectionSubtitle}>
                {staticSubjects.length} subject{staticSubjects.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <SubjectCards 
              subjects={staticSubjects}
              onSubjectPress={handleSubjectPress}
            />
          </View>
        )}

        {/* Current Subjects Section */}
        {currentSubjects.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current</Text>
              <Text style={styles.sectionSubtitle}>
                {currentSubjects.length} subject{currentSubjects.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <SubjectCards 
              subjects={currentSubjects}
              onSubjectPress={handleSubjectPress}
            />
          </View>
        )}

        {/* Show message if no subjects */}
        {staticSubjects.length === 0 && currentSubjects.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No subjects available</Text>
          </View>
        )}
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background || '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sectionContainer: {
    paddingVertical: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});