import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/Colors';
import { LoadingSpinner } from './src/components/common/LoadingSpinner';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner size={'large'} color={Colors.light.primary}/>} persistor={persistor}>
        <SafeAreaView style={styles.safeArea}>
          <AppNavigator />
        </SafeAreaView>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});