import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import { AuthOptions } from '../components/Authentication/AuthOptions';
import { MobileAuth } from '../components/Authentication/MobileAuth';
import { OTPVerification } from '../components/Authentication/OTPVerification';
import { UserOnboarding } from '../components/Authentication/UserOnboarding';
const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AuthOptions"
      screenOptions={{ headerShown: false }}
    >
      {/* <Stack.Screen name="Welcome" component={Welcome} /> */}
      <Stack.Screen name="AuthOptions" component={AuthOptions} />
      <Stack.Screen name="MobileAuth" component={MobileAuth} />
      <Stack.Screen name="OTPVerification" component={OTPVerification} />
      <Stack.Screen name="UserOnboarding" component={UserOnboarding} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;