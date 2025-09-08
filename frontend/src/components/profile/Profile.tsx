import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { clearUser } from '../../store/slices/userSlice';
import { resetSession } from '../../store/slices/sessionSlice';
import { Colors } from '../../constants/Colors';
import { Card } from '../ui/Card';

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const { subjects } = useSelector((state: RootState) => state.subjects);

  const totalMastered = subjects.reduce((sum, subject) => sum + subject.masteredCount, 0);
  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.totalQuestions, 0);
  const overallProgress = subjects.reduce((sum, subject) => sum + subject.progress, 0) / subjects.length;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            dispatch(clearUser());
            dispatch(resetSession());
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.light.accent, Colors.light.muted]}
        style={styles.header}
      >
        <View style={styles.profileInfo}>
          <LinearGradient
            colors={[Colors.light.primary + '15', Colors.light.primary + '08']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userMobile}>{user.mobile}</Text>
        </View>

        <View style={styles.streakContainer}>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color="#FF6B35" />
            <Text style={styles.streakText}>{user.streak} day streak</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{Math.round(overallProgress)}%</Text>
          <Text style={styles.statLabel}>Overall Progress</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{totalMastered}</Text>
          <Text style={styles.statLabel}>Questions Mastered</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{subjects.length}</Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </Card>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="settings-outline" size={20} color={Colors.light.primary} />
          </View>
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.light.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="help-circle-outline" size={20} color={Colors.light.primary} />
          </View>
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.light.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.light.primary} />
          </View>
          <Text style={styles.menuText}>About</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.light.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <View style={[styles.menuIcon, styles.logoutIcon]}>
            <Ionicons name="log-out-outline" size={20} color={Colors.light.error} />
          </View>
          <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.light.error} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: {
    fontSize: 28,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  userMobile: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  logoutItem: {
    marginTop: 16,
    borderColor: Colors.light.error + '20',
    backgroundColor: Colors.light.error + '05',
  },
  logoutIcon: {
    backgroundColor: Colors.light.error + '15',
  },
  logoutText: {
    color: Colors.light.error,
    fontWeight: '600',
  },
});