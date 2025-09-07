import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { User } from '../../types';

interface HeaderProps {
  user: User;
  onNotificationPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onNotificationPress }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <View style={styles.userSection}>
        <LinearGradient
          colors={[Colors.light.primary + '15', Colors.light.primary + '08']}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{user.avatar}</Text>
        </LinearGradient>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user.name.split(' ')[0]}
          </Text>
          <Text style={styles.subtitle}>Ready for today's practice?</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={14} color="#FF6B35" />
          <Text style={styles.streakText}>{user.streak}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={18} color={Colors.light.foreground} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
  },
  userSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.mutedForeground,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginLeft: 3,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});