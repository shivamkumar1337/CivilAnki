import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { MainStackParamList } from '@/src/navigation/types';
import { RootState } from '@/src/store';
import { Header } from './Header';
import { QuickActions } from './QuickActions';
import { ProgressOverview } from './ProgressOverview';
import { SubjectCards } from './SubjectCards';
import { Colors } from '@/src/constants/Colors';
// import { MainStackParamList } from '../navigation/types';
// import { RootState } from '../store';
// import { Colors } from '../constants/Colors';
// import { Header } from './home/Header';
// import { QuickActions } from './home/QuickActions';
// import { ProgressOverview } from './home/ProgressOverview';
// import { SubjectCards } from './home/SubjectCards';

type HomeNavigationProp = StackNavigationProp<MainStackParamList, 'HomeTabs'>;

export const Home: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const user = useSelector((state: RootState) => state.user);
  const { subjects } = useSelector((state: RootState) => state.subjects);
  
  const totalPendingToday = subjects.reduce((sum, subject) => sum + subject.pendingToday, 0);
  const overallProgress = subjects.reduce((sum, subject) => sum + subject.progress, 0) / subjects.length;
  const totalMastered = subjects.reduce((sum, subject) => sum + subject.masteredCount, 0);
  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.totalQuestions, 0);

  const handleStartPractice = () => {
    navigation.navigate('Subjects');
  };

  const handleSubjectPress = (subject: any) => {
    navigation.navigate('SubTopics', { subject });
  };

  const handleViewAllSubjects = () => {
    navigation.navigate('Subjects');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Header 
          user={user} 
          onNotificationPress={() => {}} 
        />
        
        <QuickActions
          onStartPractice={handleStartPractice}
          onReviewMissed={() => {}}
          onViewProgress={() => {}}
          onTakeTest={() => {}}
        />
        
        <ProgressOverview
          overallProgress={overallProgress}
          totalMastered={totalMastered}
          totalQuestions={totalQuestions}
          todayCompleted={totalMastered}
          todayTarget={totalPendingToday + totalMastered}
          onViewDetails={() => {}}
        />
        
        <SubjectCards
          subjects={subjects}
          onSubjectPress={handleSubjectPress}
          onViewAll={handleViewAllSubjects}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
});