import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
// import { Welcome } from '../components/Welcome';
import { AuthOptions } from '../components/Authentication/AuthOptions';
import { MobileAuth } from '../components/Authentication/MobileAuth';
import { OTPVerification } from '../components/Authentication/OTPVerification';
import { Onboarding } from '../components/Onboarding';
import { Home } from '../components/home/Home';
// import { Welcome } from '../components/Authentication/Welcome';
// import { Welcome } from '../components/auth/Welcome';
// import { AuthOptions } from '../components/auth/AuthOptions';
// import { MobileAuth } from '../components/auth/MobileAuth';
// import { OTPVerification } from '../components/auth/OTPVerification';
// import { Onboarding } from '../components/home/Onboarding';

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
      {/* <Stack.Screen name="Home" component={Home} /> */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;