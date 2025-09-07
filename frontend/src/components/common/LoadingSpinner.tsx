import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

type LoadingSpinnerProps = {
  size: 'small' | 'large' | number;
  color: string;
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size, color }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: Colors.light.background,
  },
});