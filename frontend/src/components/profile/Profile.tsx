// src/components/Profile.tsx (or wherever your Profile component is)
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { clearUser } from '../../store/slices/userSlice';
import { resetSession } from '../../store/slices/sessionSlice';
import { Colors } from '../../constants/Colors';
import { Card } from '../ui/Card';

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);

  // Mock progress data - replace with real data when available
  const totalMastered = 150; // This should come from API
  const totalQuestions = 500; // This should come from API
  const overallProgress = totalQuestions > 0 ? Math.round((totalMastered / totalQuestions) * 100) : 0;

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

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Edit profile pressed');
  };

  const getAvatarText = (name: string) => {
    if (!name) return '👤';
    return name.charAt(0).toUpperCase();
  };

  const formatPhoneNumber = (phone: number) => {
    const phoneStr = phone.toString();
    if (phoneStr.length === 10) {
      return `+91 ${phoneStr.slice(0, 5)} ${phoneStr.slice(5)}`;
    }
    return `+${phoneStr}`;
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Active';
      case 1: return 'Inactive';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return '#10B981'; // Green for active
      case 1: return '#EF4444'; // Red for inactive
      default: return '#6B7280'; // Gray for unknown
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.light.primary} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primary + 'DD']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user.avatar_url ? user.avatar_url : getAvatarText(user.name || '')}
              </Text>
            </LinearGradient>
            
            <Text style={styles.userName}>{user.name || 'User Name'}</Text>
            
            {user.phone && (
              <Text style={styles.userContact}>{formatPhoneNumber(user.phone)}</Text>
            )}
            
            {user.email && (
              <Text style={styles.userContact}>{user.email}</Text>
            )}

            <View style={styles.goalContainer}>
              <Text style={styles.goalText}>{user.goal || 'UPSC'}</Text>
              <Text style={styles.yearText}>Target: {user.target_year || '2026'}</Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Ionicons name="pencil" size={16} color={Colors.light.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.streakContainer}>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={18} color="#FF6B35" />
              <Text style={styles.streakText}>{user.streak || 0} day streak</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status || 0) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(user.status || 0) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(user.status || 0) }]}>
                {getStatusText(user.status || 0)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{overallProgress}%</Text>
            <Text style={styles.statLabel}>Overall Progress</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{totalMastered}</Text>
            <Text style={styles.statLabel}>Questions Mastered</Text>
          </Card>
        </View>

        {/* Account Info */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member since</Text>
              <Text style={styles.infoValue}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.infoValue}>{user.id?.slice(0, 8) || 'N/A'}...</Text>
            </View>
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

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  userContact: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  goalContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  yearText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginLeft: 6,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    marginLeft: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    marginTop: -12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    textAlign: 'center',
    fontWeight: '500',
  },
  subjectStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  subjectStatCard: {
    padding: 16,
  },
  subjectStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subjectStatLabel: {
    fontSize: 14,
    color: Colors.light.foreground,
    fontWeight: '500',
  },
  subjectStatNumber: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  accountSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.light.foreground,
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