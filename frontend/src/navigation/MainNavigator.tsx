import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainStackParamList, HomeTabParamList } from './types';
import { Home } from '../components/home/Home';
import { QuestionHistory } from '../components/QuestionHistory';
import { Settings } from '../components/Settings';
import { SubjectSelection } from '../components/SubjectSelection';
import { SubTopicSelection } from '../components/SubTopicSelection';
import { QuestionCard } from '../components/QuestionCard';
import { SessionSummary } from '../components/SessionSummary';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Profile } from '../components/profile/Profile';


const Stack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<HomeTabParamList>();

const HomeTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Practice') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.mutedForeground,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopColor: Colors.light.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Home}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Practice" 
        component={SubjectSelection}
        options={{ title: 'Practice' }}
      />
      <Tab.Screen 
        name="History" 
        component={QuestionHistory}
        options={{ title: 'History' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeTabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="Subjects" component={SubjectSelection} />
      <Stack.Screen name="SubTopics" component={SubTopicSelection} />
      <Stack.Screen name="Practice" component={QuestionCard} />
      <Stack.Screen name="Summary" component={SessionSummary} />
    </Stack.Navigator>
  );
};

export default MainNavigator;