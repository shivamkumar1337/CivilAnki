import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Colors';
import { LoadingSpinner } from './src/components/common/LoadingSpinner';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <Provider store={store}>
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