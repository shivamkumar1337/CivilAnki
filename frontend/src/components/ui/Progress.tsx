import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ProgressProps {
  value: number; // 0-100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  height = 8,
  backgroundColor = Colors.light.muted,
  progressColor = Colors.light.primary
}) => {
  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <View
        style={[
          styles.progress,
          {
            width: `${Math.max(0, Math.min(100, value))}%`,
            backgroundColor: progressColor,
            height
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
});