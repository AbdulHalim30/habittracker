import { View, Text, SectionList, StyleSheet } from "react-native";
import HabitCard from "./HabitCard";
import { Habit, TimeOfDay } from "../types";
import { getSectionsForTab } from "../constants/data";

type Props = {
  habits: Habit[];
  activeTab: TimeOfDay;
  selectedDate: string;
  isCompleted: (habitId: string) => boolean;
  onToggle: (habitId: string) => void;
  onDelete: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
};

export default function HabitList({
  habits,
  activeTab,
  isCompleted,
  onToggle,
  onDelete,
  onEdit,
}: Props) {
  const sectionData = getSectionsForTab(activeTab)
    .map((section) => ({
      ...section,
      data: habits.filter((h) => h.time === section.key),
    }))
    .filter((section) => section.data.length > 0);

  return (
    <SectionList
      sections={sectionData}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
      stickySectionHeadersEnabled={false}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyText}>Belum ada habit.</Text>
          <Text style={styles.emptySubtext}>Tap "+ Buat" untuk mulai!</Text>
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>{section.icon}</Text>
          <Text style={styles.sectionTitle}>{section.label}</Text>
          <View style={styles.sectionLine} />
        </View>
      )}
      renderItem={({ item }) => (
        <HabitCard
          habit={item}
          completed={isCompleted(item.id)}
          onToggle={() => onToggle(item.id)}
          onDelete={() => onDelete(item.id)}
          onEdit={() => onEdit(item)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: "600", color: "#aaa" },
  emptySubtext: { fontSize: 13, color: "#ccc", marginTop: 4 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 6,
  },
  sectionIcon: { fontSize: 14 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 8,
  },
});
