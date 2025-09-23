// src/components/home/Header.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../../constants/Colors';
import { User } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { HomeService } from '../../services/HomeService';
import { setUser } from '../../store/slices/userSlice';
import { MainStackParamList } from '../../navigation/types';

interface HeaderProps {
  onNotificationPress: () => void;
}

type HeaderNavigationProp = StackNavigationProp<MainStackParamList>;

export const Header: React.FC<HeaderProps> = ({ onNotificationPress }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<HeaderNavigationProp>();
  const user = useSelector((state: any) => state.user);

  // src/components/home/Header.tsx
// Update the useEffect in your existing Header component:

useEffect(() => {
  const fetchProfile = async () => {
    // Only fetch profile if user is authenticated
    if (!user.isAuthenticated || !user.session) {
      return;
    }

    try {
      const { profile } = await HomeService.getProfile();
      console.log('Fetched profile:', profile);
      
      // Update user data while preserving authentication state
      dispatch(setUser({
        ...user, // Preserve existing user data
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        streak: profile.streak,
        goal: profile.goal,
        target_year: profile.target_year,
        avatar_url: profile.avatar_url,
        id: profile.id,
        status: profile.status,
        created_at: profile.created_at,
        // Keep authentication state
        isAuthenticated: true,
        onboarding_completed: true,
      }));
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  fetchProfile();
}, [user.session, user.isAuthenticated]); // Depend on session and auth state

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  // Generate avatar text from name
  const getAvatarText = (name: string) => {
    if (!name) return '👤';
    return name.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.userSection} 
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: Colors.light.primary }]}>
          <Text style={styles.avatarText}>
            {user.avatar_url ? user.avatar_url : getAvatarText(user.name || '')}
          </Text>
          </View>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>  
            {`Hi, ${user.name || 'User'}`}
          </Text>
          {user.goal && (
            <Text style={styles.subtitle}>
              {user.goal} • {user.target_year}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={20} color="#FF6B35" />
          <Text style={styles.streakText}>{user.streak || 0}</Text>
        </View>
        {/* <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={18} color={Colors.light.foreground} />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 2,
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
    fontWeight: '600',
    color: '#fff',
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