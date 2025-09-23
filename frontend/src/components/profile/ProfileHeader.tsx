// components/profile/ProfileHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { StyleSheet } from 'react-native';

interface ProfileHeaderProps {
  user: any;
  onBack: () => void;
  onEditProfile: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onBack,
  onEditProfile
}) => {
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

  const getAccountAge = (dateString: string) => {
    if (!dateString) return 'New';
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays}d`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}mo`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}y`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.foreground} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Profile</Text>
        
        <TouchableOpacity style={styles.editButton} onPress={onEditProfile}>
          <Ionicons name="pencil" size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Profile Section */}
      <View style={styles.profileSection}>
        {/* Avatar and Basic Info Row */}
        <View style={styles.avatarRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.avatar_url ? user.avatar_url : getAvatarText(user.name || '')}
              </Text>
            </View>

          </View>
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>{user.name || 'User Name'}</Text>
            
            {user.phone && (
              <Text style={styles.userContact}>{formatPhoneNumber(user.phone)}</Text>
            )}
            
            {user.email && (
              <Text style={styles.userEmail}>{user.email}</Text>
            )}

            {/* Member Badge Row */}
            <View style={styles.badgeRow}>
              <View style={styles.memberBadge}>
                <Ionicons name="diamond" size={10} color={Colors.light.warning} />
                <Text style={styles.memberText}>Premium</Text>
              </View>
              <Text style={styles.memberSince}>
                {getAccountAge(user.created_at)} member
              </Text>
            </View>
          </View>
        </View>

        {/* Compact Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Ionicons name="trophy-outline" size={14} color={Colors.light.primary} />
              <Text style={styles.statLabel}>Goal</Text>
            </View>
            <Text style={styles.statValue}>{user.goal || 'UPSC'} {user.target_year || '2026'}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <Ionicons name="flame" size={14} color="#FF6B35" />
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <Text style={styles.statValue}>{user.streak || 0} days</Text>
          </View>
          
        </View>
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.foreground,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    paddingHorizontal: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.primaryForeground,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.success + '30',
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.success,
    marginRight: 3,
  },
  statusText: {
    fontSize: 9,
    color: Colors.light.success,
    fontWeight: '600',
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  userContact: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
    marginBottom: 2,
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 13,
    color: Colors.light.mutedForeground,
    fontWeight: '400',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.warning + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  memberText: {
    fontSize: 10,
    color: Colors.light.warning,
    fontWeight: '600',
    marginLeft: 2,
  },
  memberSince: {
    fontSize: 10,
    color: Colors.light.mutedForeground,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.muted,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,

  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.light.mutedForeground,
    fontWeight: '500',
    marginLeft: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 13,
    color: Colors.light.foreground,
    fontWeight: '600',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.light.border,
    marginHorizontal: 12,
    opacity: 0.6,
  },
});