import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TimeOfDay } from "../types";
import { Colors, useThemedStyles } from "../constants/theme";

type Props = {
  selected: TimeOfDay;
  onSelect: (time: TimeOfDay) => void;
};

const TABS = [
  { key: "all", label: "All", icon: "🌀" },
  { key: "morning", label: "Morning", icon: "🌅" },
  { key: "afternoon", label: "Afternoon", icon: "☀️" },
  { key: "evening", label: "Evening", icon: "🌙" },
];

export default function TimeTabBar({ selected, onSelect }: Props) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, selected === tab.key && styles.tabSelected]}
          onPress={() => onSelect(tab.key as TimeOfDay)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text
            style={[
              styles.tabLabel,
              selected === tab.key && styles.tabLabelSelected,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: c.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      gap: 6,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: c.surfaceAlt,
    },
    tabSelected: {
      backgroundColor: c.primary,
    },
    tabIcon: { fontSize: 16 },
    tabLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: c.textMuted,
      marginTop: 2,
    },
    tabLabelSelected: { color: c.onPrimary },
  });
