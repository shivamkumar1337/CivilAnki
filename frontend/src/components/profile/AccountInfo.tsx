// components/profile/AccountInfo.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Card } from '../ui/Card';
import { StyleSheet } from 'react-native';

interface AccountInfoProps {
  user: any;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({ user }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const additionalInfo = [
    {
      icon: 'shield-checkmark',
      label: 'Verification Status',
      value: 'Verified',
      color: Colors.light.success,
    },
    {
      icon: 'calendar',
      label: 'Joined Date',
      value: formatDate(user.created_at),
      color: Colors.light.primary,
    },
    {
      icon: 'settings',
      label: 'Account Settings',
      value: 'Configured',
      color: Colors.light.mutedForeground,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Additional Information</Text>
      
      <Card style={styles.infoCard}>
        {additionalInfo.map((item, index) => (
          <React.Fragment key={index}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
                <Text style={styles.infoLabel}>{item.label}</Text>
              </View>
              <Text style={[styles.infoValue, { color: item.color }]}>
                {item.value}
              </Text>
            </View>
            {index < additionalInfo.length - 1 && (
              <View style={styles.separator} />
            )}
          </React.Fragment>
        ))}
      </Card>
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.foreground,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.light.foreground,
    fontWeight: '500',
    marginLeft: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 4,
    opacity: 0.5,
  },
});