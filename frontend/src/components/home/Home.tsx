import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView,Image, StatusBar, View, Text, TouchableOpacity, FlatList } from 'react-native';
// import { Image } from 'expo-image';

import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { MainStackParamList } from '@/src/navigation/types';
import { RootState } from '@/src/store';
import { Header } from './Header';
import { QuickActions } from './QuickActions';
import { ProgressOverview } from './ProgressOverview';
import { Colors } from '@/src/constants/Colors';
import { getImageSource } from '@/assets/images';
import { mockSubjects,mockcurrentSubjects } from '@/src/constants/mockData';
import { SubjectCards } from './SubjectCards';
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
  // const { subjects } = useSelector((state: RootState) => state.subjects);
  const subjects  = mockSubjects
  const currentSubjects  = mockcurrentSubjects


  
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

  // Helper SubjectCard component styled as per your design
  // const SubjectCard = ({ subject, onPress }: { subject: any; onPress: () => void }) => (
  //   <TouchableOpacity
  //     onPress={onPress}
  //     style={{
  //       marginRight: 16,
  //       alignItems: 'center',
  //       width: 128,
  //     }}
  //     activeOpacity={0.8}
  //   >
  //     <View
  //       style={{
  //         aspectRatio: 9 / 15,
  //         width: 128,
  //         marginBottom: 12,
  //         borderRadius: 12,
  //         borderWidth: 1,
  //         borderColor: '#e5e7eb',
  //         overflow: 'hidden',
  //         backgroundColor: '#fff',
  //       }}
  //     >
  //       <Image
  //         // source={subject.imageUrl}
  //         source={getImageSource(subject.name)}
  //         style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
  //       />
  //     </View>
  //     <Text
  //       style={{
  //         fontSize: 14,
  //         color: '#111827',
  //         textAlign: 'left',
  //         width: 128,
  //         lineHeight: 18,
  //         fontWeight: '500',
  //         marginLeft: 20,
  //       }}
  //       numberOfLines={2}
  //     >
  //       {subject.name}
  //     </Text>
  //   </TouchableOpacity>
  // );

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
        
        {/* <QuickActions
          onStartPractice={handleStartPractice}
          onReviewMissed={() => {}}
          onViewProgress={() => {}}
          onTakeTest={() => {}}
        /> */}
        
        <ProgressOverview
          overallProgress={overallProgress}
          totalMastered={totalMastered}
          totalQuestions={totalQuestions}
          todayCompleted={totalMastered}
          todayTarget={totalPendingToday + totalMastered}
          onViewDetails={() => {}}
        />
        
        {/* Replace the SubjectCards usage with this horizontally scrolling section */}
        <View style={{ paddingVertical: 16 }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 18, color: '#111827', fontWeight: '600' }}>Static</Text>
          </View>
          <SubjectCards/>
          {/* <TouchableOpacity onPress={handleViewAllSubjects} style={{ alignSelf: 'flex-end', margin: 16 }}>
            <Text style={{ color: '#2563eb', fontWeight: '500' }}>View All</Text>
          </TouchableOpacity> */}
        </View>


         {/* currentSubjects    */}
         <View style={{ paddingVertical: 16 }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 18, color: '#111827', fontWeight: '600' }}>Current</Text>
          </View>
          <SubjectCards/>
          {/* <TouchableOpacity onPress={handleViewAllSubjects} style={{ alignSelf: 'flex-end', margin: 16 }}>
            <Text style={{ color: '#2563eb', fontWeight: '500' }}>View All</Text>
          </TouchableOpacity> */}
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
  scrollView: {
    flex: 1,
  },
});