import React from 'react';
import { Switch as RNSwitch, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false
}) => {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: Colors.light.muted,
        true: Colors.light.primary
      }}
      thumbColor={Platform.OS === 'ios' ? undefined : Colors.light.background}
      ios_backgroundColor={Colors.light.muted}
    />
  );
};