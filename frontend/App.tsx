import React, { useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Colors';
import { LoadingSpinner } from './src/components/common/LoadingSpinner';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthenticated, setSession } from './src/store/slices/authSlice';

const RestoreAuth: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
        const session = await AsyncStorage.getItem('session');
        if (isAuthenticated === 'true') {
          dispatch(setAuthenticated(true));
        }
        if (session) {
          dispatch(setSession(JSON.parse(session)));
        }
      } finally {
        onReady();
      }
    };
    restoreAuth();
  }, [dispatch, onReady]);

  return null;
};

export default function App() {
  const [ready, setReady] = useState(false);

  if (!ready) {
    return (
      <Provider store={store}>
        <RestoreAuth onReady={() => setReady(true)} />
      </Provider>
    );
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <Provider store={store}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <AppNavigator />
    </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});