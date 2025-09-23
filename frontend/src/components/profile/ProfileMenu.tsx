// components/profile/ProfileMenu.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { StyleSheet } from 'react-native';

interface ProfileMenuProps {
  onLogout: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ onLogout }) => {
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
          onPress: onLogout,
        },
      ],
    );
  };

  const menuItems = [
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'Preferences and notifications',
      onPress: () => console.log('Settings pressed'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => console.log('Help pressed'),
    },
    // {
    //   icon: 'information-circle-outline',
    //   title: 'About',
    //   subtitle: 'App version and information',
    //   onPress: () => console.log('About pressed'),
    // },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={item.onPress}
        >
          <View style={styles.menuIcon}>
            <Ionicons name={item.icon as any} size={22} color={Colors.light.primary} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.light.mutedForeground} />
        </TouchableOpacity>
      ))}

      {/* Logout Button */}
      <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
        <View style={[styles.menuIcon, styles.logoutIcon]}>
          <Ionicons name="log-out-outline" size={22} color={Colors.light.error} />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuTitle, styles.logoutText]}>Logout</Text>
          <Text style={styles.menuSubtitle}>Sign out of your account</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.light.error} />
      </TouchableOpacity>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,

  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,

  },
  menuContent: {
    flex: 1,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.foreground,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.light.mutedForeground,
    fontWeight: '500',
    lineHeight: 18,
  },
  logoutItem: {
    // marginTop: 24,
    borderColor: Colors.light.error + '25',
    borderWidth: 1.5,
  },
  logoutIcon: {
    backgroundColor: Colors.light.error + '15',
  },
  logoutText: {
    color: Colors.light.error,
    fontWeight: '700',
  },
});