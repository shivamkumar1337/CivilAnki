import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Progress } from "./ui/Progress";
import { Badge } from "./ui/Badge";
import { Colors } from "../constants/Colors";
import { Subject } from "../types";
import { Ionicons } from "@expo/vector-icons";

interface SubjectSelectionProps {
  subjects: Subject[];
  onSubjectSelect: (subject: Subject) => void;
  onBack: () => void;
}

export const SubjectSelection: React.FC<SubjectSelectionProps> = ({
  subjects,
  onSubjectSelect,
  onBack,
}) => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const renderSubjectListItem = ({ item: subject }: { item: Subject }) => (
    <Card style={styles.listCard} onPress={() => onSubjectSelect(subject)}>
      <View style={styles.listItemHeader}>
        <View style={styles.listItemInfo}>
          <View style={styles.iconContainer}>
            <Text style={styles.subjectIcon}>{subject.icon}</Text>
          </View>
          <View style={styles.subjectDetails}>
            <Text style={styles.subjectName}>{subject.name}</Text>
            <Text style={styles.masteredText}>
              {subject.masteredCount} of {subject.totalQuestions} mastered
            </Text>
          </View>
        </View>

        <View style={styles.listItemStats}>
          <View style={styles.statsRow}>
            <Text style={styles.progressText}>{subject.progress}%</Text>
            {subject.pendingToday > 0 && (
             <Badge
  variant="secondary"
  style={styles.pendingBadge}         // For container styles (ViewStyle)
  textStyle={styles.pendingBadgeText} // For text styles (TextStyle)
>
  {subject.pendingToday} pending
</Badge>
            )}
          </View>
        </View>
      </View>

      <Progress
        value={subject.progress}
        height={8}
      />

      <View style={styles.listItemFooter}>
        <Text style={styles.subtopicsText}>
          {subject.subtopics.length} subtopics
        </Text>
        <Text style={styles.statusText}>
          {subject.pendingToday > 0
            ? `${subject.pendingToday} due today`
            : "All caught up"}
        </Text>
      </View>
    </Card>
  );

  const renderSubjectGridItem = ({ item: subject }: { item: Subject }) => (
    <Card style={styles.gridCard} onPress={() => onSubjectSelect(subject)}>
      <View style={styles.gridContent}>
        <Text style={styles.gridIcon}>{subject.icon}</Text>
        <Text style={styles.gridSubjectName}>{subject.name}</Text>
        <Text style={styles.gridMasteredText}>
          {subject.masteredCount}/{subject.totalQuestions}
        </Text>

        <View style={styles.gridProgress}>
          <View style={styles.circularProgress}>
            <Text style={styles.gridProgressText}>{subject.progress}%</Text>
          </View>
        </View>
      </View>

      {subject.pendingToday > 0 && (
        <Badge variant="secondary" style={styles.gridPendingBadge}>
          {subject.pendingToday} pending
        </Badge>
      )}
    </Card>
  );

  const totalPending = subjects.reduce((sum, s) => sum + s.pendingToday, 0);
  const totalMastered = subjects.reduce((sum, s) => sum + s.masteredCount, 0);
  const overallProgress = Math.round(
    subjects.reduce((sum, s) => sum + s.progress, 0) / subjects.length
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.light.foreground}
            />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Choose Subject</Text>
            <Text style={styles.subtitle}>Select a subject to practice</Text>
          </View>
        </View>

        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "list" && styles.activeToggle,
            ]}
            onPress={() => setViewMode("list")}
          >
            <Text style={styles.toggleIcon}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "grid" && styles.activeToggle,
            ]}
            onPress={() => setViewMode("grid")}
          >
            <Text style={styles.toggleIcon}>⊞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subject List/Grid */}
      <View style={styles.content}>
        <FlatList
          data={subjects}
          renderItem={
            viewMode === "list" ? renderSubjectListItem : renderSubjectGridItem
          }
          keyExtractor={(item) => item.id}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          overScrollMode="never" // Android: disables halo effect
          bounces={false} // iOS: disables bounce effect
        />
      </View>

      {/* Quick Stats */}
      <Card style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalPending}</Text>
            <Text style={styles.statLabel}>Pending Today</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalMastered}</Text>
            <Text style={styles.statLabel}>Total Mastered</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{overallProgress}%</Text>
            <Text style={styles.statLabel}>Overall Progress</Text>
          </View>
        </View>
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: 35, // Add gap from top
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8, // Reduce since container now has padding
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.light.foreground,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.light.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  viewModeToggle: {
    flexDirection: "row",
    backgroundColor: Colors.light.muted,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  activeToggle: {
    backgroundColor: Colors.light.background,
  },
  toggleIcon: {
    fontSize: 16,
    color: Colors.light.foreground,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingVertical: 24,
  },
  listCard: {
    marginBottom: 16,
    padding: 24,
  },
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  listItemInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  subjectIcon: {
    fontSize: 20,
  },
  subjectDetails: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  masteredText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  listItemStats: {
    alignItems: "flex-end",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.foreground,
  },
 pendingBadge: {
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 8,
  backgroundColor: Colors.light.warning,
  alignSelf: 'flex-start',
  marginLeft: 8,
},
pendingBadgeText: {
  fontSize: 13,
  color: '#fff',
  fontWeight: 'bold'},
progressBar: {
    marginBottom: 12,
  },
  listItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subtopicsText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  statusText: {
    fontSize: 14,
    color: Colors.light.mutedForeground,
  },
  gridCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    aspectRatio: 1,
  },
  gridContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gridIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  gridSubjectName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.foreground,
    marginBottom: 4,
    textAlign: "center",
  },
  gridMasteredText: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
    marginBottom: 12,
  },
  gridProgress: {
    marginBottom: 12,
  },
  circularProgress: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  gridProgressText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.foreground,
  },
  gridPendingBadge: {
    alignSelf: "center",
    fontSize: 12,
  },
  statsCard: {
    margin: 24,
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.foreground,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.mutedForeground,
  },
});
