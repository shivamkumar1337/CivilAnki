import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Home } from './src/components/Home';
import { Onboarding } from './src/components/Onboarding';
import { SubjectSelection } from './src/components/SubjectSelection';
import { SubTopicSelection } from './src/components/SubTopicSelection';
import { QuestionCard } from './src/components/QuestionCard';
import { SessionSummary } from './src/components/SessionSummary';
import { Settings } from './src/components/Settings';
import { QuestionHistory } from './src/components/QuestionHistory';

import { mockUser, mockSubjects, mockYearRanges, mockQuestions } from './src/constants/mockData';
import { Screen, SessionData, Subject, SubTopic, YearRange } from './src/types';

const Stack = createStackNavigator();

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData>({
    selectedSubject: null,
    selectedSubtopics: [],
    selectedYearRanges: [],
    mode: 'untimed',
    questions: [],
    currentQuestionIndex: 0,
    answers: []
  });

  const startSession = (subject: Subject, subtopics: SubTopic[], yearRanges: YearRange[], mode: 'timed' | 'untimed') => {
    // Filter questions based on selection
    const filteredQuestions = mockQuestions.filter(q => 
      q.subject === subject.id && 
      subtopics.some(st => st.id === q.subtopic)
    ).slice(0, 30); // Limit to 30 questions

    setSessionData({
      selectedSubject: subject,
      selectedSubtopics: subtopics,
      selectedYearRanges: yearRanges,
      mode,
      questions: filteredQuestions,
      currentQuestionIndex: 0,
      answers: []
    });
  };

  if (!hasCompletedOnboarding) {
    return (
      <>
        <StatusBar style="auto" />
        <Onboarding onComplete={() => setHasCompletedOnboarding(true)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        >
          <Stack.Screen name="Home">
            {(props) => (
              <Home
                {...props}
                user={mockUser}
                subjects={mockSubjects}
                onNavigate={(screen: Screen) => {
                  switch (screen) {
                    case 'subjects':
                      props.navigation.navigate('SubjectSelection');
                      break;
                    case 'settings':
                      props.navigation.navigate('Settings');
                      break;
                    case 'history':
                      props.navigation.navigate('QuestionHistory');
                      break;
                  }
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="SubjectSelection">
            {(props) => (
              <SubjectSelection
                {...props}
                subjects={mockSubjects}
                onSubjectSelect={(subject) => {
                  setSessionData(prev => ({ ...prev, selectedSubject: subject }));
                  props.navigation.navigate('SubTopicSelection');
                }}
                onBack={() => props.navigation.goBack()}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="SubTopicSelection">
            {(props) => (
              <SubTopicSelection
                {...props}
                subject={sessionData.selectedSubject!}
                yearRanges={mockYearRanges}
                onStartSession={(subject, subtopics, yearRanges, mode) => {
                  startSession(subject, subtopics, yearRanges, mode);
                  props.navigation.navigate('QuestionCard');
                }}
                onBack={() => props.navigation.goBack()}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="QuestionCard">
            {(props) => (
              <QuestionCard
                {...props}
                sessionData={sessionData}
                onUpdateSession={setSessionData}
                onSessionComplete={() => props.navigation.navigate('SessionSummary')}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="SessionSummary">
            {(props) => (
              <SessionSummary
                {...props}
                sessionData={sessionData}
                onContinue={() => props.navigation.navigate('Home')}
                onReviewMissed={() => {
                  // Filter missed questions and restart session
                  const missedQuestions = sessionData.answers
                    .filter(a => !a.isCorrect)
                    .map(a => sessionData.questions.find(q => q.id === a.questionId)!)
                    .filter(Boolean);
                  
                  setSessionData(prev => ({
                    ...prev,
                    questions: missedQuestions,
                    currentQuestionIndex: 0,
                    answers: []
                  }));
                  props.navigation.navigate('QuestionCard');
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Settings">
            {(props) => (
              <Settings
                {...props}
                onBack={() => props.navigation.goBack()}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="QuestionHistory">
            {(props) => (
              <QuestionHistory
                {...props}
                onBack={() => props.navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}