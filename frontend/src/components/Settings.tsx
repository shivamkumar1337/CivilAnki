import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Switch } from './ui/Switch';
import { Badge } from './ui/Badge';
import { Colors } from '../constants/Colors';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    quickReviewNotifications: true,
    dailyReminders: true,
    weeklyProgress: false,
    darkMode: false,
    offlineMode: true,
    autoSync: true,
    largeText: false,
    highContrast: false,
    notifications7min: true,
    notifications21min: true,
    notificationsDaily: true
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your experience</Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🔔</Text>
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>7-minute reviews</Text>
                <Text style={styles.settingDescription}>Get notified for quick reviews</Text>
              </View>
              <Switch
                value={settings.notifications7min}
                onValueChange={(value) => updateSetting('notifications7min', value)}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>21-minute reviews</Text>
                <Text style={styles.settingDescription}>Reminders for scheduled reviews</Text>
              </View>
              <Switch
                value={settings.notifications21min}
                onValueChange={(value) => updateSetting('notifications21min', value)}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Daily reminders</Text>
                <Text style={styles.settingDescription}>Daily study session reminders</Text>
              </View>
              <Switch
                value={settings.notificationsDaily}
                onValueChange={(value) => updateSetting('notificationsDaily', value)}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Weekly progress</Text>
                <Text style={styles.settingDescription}>Weekly performance summaries</Text>
              </View>
              <Switch
                value={settings.weeklyProgress}
                onValueChange={(value) => updateSetting('weeklyProgress', value)}
              />
            </View>
          </Card>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🌙</Text>
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>

          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Dark mode</Text>
                <Text style={styles.settingDescription}>Use dark theme</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => updateSetting('darkMode', value)}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Large text</Text>
                <Text style={styles.settingDescription}>Increase font size for readability</Text>
              </View>
              <Switch
                value={settings.largeText}
                onValueChange={(value) => updateSetting('largeText', value)}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>High contrast</Text>
                <Text style={styles.settingDescription}>Better visibility for low vision</Text>
              </View>
              <Switch
                value={settings.highContrast}
                onValueChange={(value) => updateSetting('highContrast', value)}
              />
            </View>
          </Card>
        </View>

        {/* Data & Sync */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📡</Text>
            <Text style={styles.sectionTitle}>Data & Sync</Text>
          </View>

          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto sync</Text>
                <Text style={styles.settingDescription}>Sync progress across devices</Text>
              </View>
              <View style={styles.settingRight}>
                <Badge 
                  variant={settings.autoSync ? 'default' : 'secondary'}
                  style={styles.statusBadge}
                >
                  {settings.autoSync ? 'Connected' : 'Offline'}
                </Badge>
                <Switch
                  value={settings.autoSync}
                  onValueChange={(value) => updateSetting('autoSync', value)}
                />
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Offline mode</Text>
                <Text style={styles.settingDescription}>Download content for offline use</Text>
              </View>
              <Switch
                value={settings.offlineMode}
                onValueChange={(value) => updateSetting('offlineMode', value)}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Download questions</Text>
                <Text style={styles.settingDescription}>Cache questions locally</Text>
              </View>
              <Button
                title="📥 Download"
                variant="outline"
                size="sm"
                onPress={() => {}}
              />
            </View>
          </Card>
        </View>

        {/* Study Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📱</Text>
            <Text style={styles.sectionTitle}>Study Settings</Text>
          </View>

          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Default session length</Text>
                <Text style={styles.settingDescription}>Number of questions per session</Text>
              </View>
              <Badge variant="secondary">30 questions</Badge>
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Timer duration</Text>
                <Text style={styles.settingDescription}>Time per question in timed mode</Text>
              </View>
              <Badge variant="secondary">2 minutes</Badge>
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Review intervals</Text>
                <Text style={styles.settingDescription}>Spaced repetition timing</Text>
              </View>
              <Badge variant="secondary">Optimized</Badge>
            </View>
          </Card>
        </View>

        {/* Account & Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👤</Text>
            <Text style={styles.sectionTitle}>Account</Text>
          </View>

          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Profile</Text>
                <Text style={styles.settingDescription}>Manage your account settings</Text>
              </View>
              <Button
                title="View Profile"
                variant="outline"
                size="sm"
                onPress={() => {}}
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Data export</Text>
                <Text style={styles.settingDescription}>Download your progress data</Text>
              </View>
              <Button
                title="Export"
                variant="outline"
                size="sm"
                onPress={() => {}}
              />
            </View>
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>ℹ️</Text>
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <Card style={styles.settingsCard}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Questions database</Text>
              <Text style={styles.aboutValue}>Updated daily</Text>
            </View>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Last sync</Text>
              <Text style={styles.aboutValue}>2 hours ago</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.light.foreground,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
  },
  settingsCard: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 8,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 14,
    color: Colors.light.foreground,
  },
  aboutValue: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
});