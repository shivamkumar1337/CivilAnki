import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { User } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { HomeService } from '../../services/HomeService';
import { setUser } from '../../store/slices/userSlice';

interface HeaderProps {
  onNotificationPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNotificationPress }) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.user);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user.session?.access_token) {
        try {
          const profile = await HomeService.getProfile(user.session.access_token);
          dispatch(setUser({
            name: profile.name,
            email: profile.email,
            mobile: profile.mobile,
            streak: profile.streak,
            avatar: profile.avatar,
            id: profile.id,
          }));
        } catch (e) {
          // Optionally handle error
        }
      }
    };
    fetchProfile();
  }, [user.session, dispatch]);

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
            {user.name ? `Hi, ${user.name}` : 'Welcome!'}
          </Text>
          <Text style={styles.subtitle}>
            {user.email || user.mobile}
          </Text>
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
    // backgroundColor: Colors.light.background,
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