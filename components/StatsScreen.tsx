import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Habit, HabitLog } from "../types";
import { parseDateKey, toDateKey, todayKey } from "../utils/date";
import Heatmap from "./Heatmap";
import { Colors, useTheme, useThemedStyles } from "../constants/theme";

type Props = {
  habits: Habit[];
  logs: HabitLog[];
  onClose: () => void;
};

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function getLast7Days(): string[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

function getLast30Days(): string[] {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

function formatDate(dateStr: string): string {
  const d = parseDateKey(dateStr);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

export default function StatsScreen({ habits, logs, onClose }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { isDark, colors } = useTheme();
  const [period, setPeriod] = useState<"7" | "30">("7");
  const dates = period === "7" ? getLast7Days() : getLast30Days();

  // Heatmap memeriksa ratusan tanggal per habit, jadi pakai Set, bukan logs.some
  const completedSet = useMemo(
    () =>
      new Set(
        logs.filter((l) => l.completed).map((l) => `${l.habitId}|${l.date}`)
      ),
    [logs]
  );

  function isCompleted(habitId: string, date: string) {
    return completedSet.has(`${habitId}|${date}`);
  }

  // Proporsi habit selesai di satu tanggal, null kalau tidak ada habit aktif
  function getDayValue(date: string): number | null {
    const total = getTotalActiveForDate(date);
    if (total === 0) return null;
    return getCompletedCountForDate(date) / total;
  }

  // Hari sebelum habit dibuat tidak dihitung aktif
  function isActiveDay(habit: Habit, date: string) {
    if (date < toDateKey(new Date(habit.createdAt))) return false;
    return habit.days.includes(parseDateKey(date).getDay());
  }

  // Hitung completion rate per habit
  function getCompletionRate(habit: Habit): number {
    const activeDates = dates.filter((d) => isActiveDay(habit, d));
    if (activeDates.length === 0) return 0;
    const completedCount = activeDates.filter((d) =>
      isCompleted(habit.id, d)
    ).length;
    return Math.round((completedCount / activeDates.length) * 100);
  }

  // Hitung streak saat ini
  function getCurrentStreak(habit: Habit): number {
    let streak = 0;
    const today = new Date();
    const todayStr = toDateKey(today);
    const todayDone = isCompleted(habit.id, todayStr);

    let checkDate = new Date(today);
    if (!todayDone) checkDate.setDate(checkDate.getDate() - 1);

    const createdStr = toDateKey(new Date(habit.createdAt));
    while (streak <= 365) {
      const dateStr = toDateKey(checkDate);
      if (dateStr < createdStr) break;
      if (isActiveDay(habit, dateStr)) {
        if (isCompleted(habit.id, dateStr)) {
          streak++;
        } else {
          break;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  }

  // Total habit selesai per hari (untuk bar chart sederhana)
  function getCompletedCountForDate(date: string): number {
    const activeHabits = habits.filter((h) => isActiveDay(h, date));
    return activeHabits.filter((h) => isCompleted(h.id, date)).length;
  }

  function getTotalActiveForDate(date: string): number {
    return habits.filter((h) => isActiveDay(h, date)).length;
  }

  const maxBar = Math.max(...dates.map((d) => getTotalActiveForDate(d)), 1);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.surface}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistik</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Period Toggle */}
        <View style={styles.periodToggle}>
          <TouchableOpacity
            style={[styles.periodBtn, period === "7" && styles.periodBtnActive]}
            onPress={() => setPeriod("7")}
          >
            <Text
              style={[
                styles.periodText,
                period === "7" && styles.periodTextActive,
              ]}
            >
              7 Hari
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodBtn,
              period === "30" && styles.periodBtnActive,
            ]}
            onPress={() => setPeriod("30")}
          >
            <Text
              style={[
                styles.periodText,
                period === "30" && styles.periodTextActive,
              ]}
            >
              30 Hari
            </Text>
          </TouchableOpacity>
        </View>

        {/* Heatmap Aktivitas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktivitas</Text>
          <Heatmap getValue={getDayValue} color={colors.primary} showLegend />
        </View>

        {/* Bar Chart Harian */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion per Hari</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chartContainer}>
              {dates.map((date) => {
                const completed = getCompletedCountForDate(date);
                const total = getTotalActiveForDate(date);
                const barHeight =
                  total === 0 ? 4 : Math.max((completed / maxBar) * 120, 4);
                const isToday = date === todayKey();

                return (
                  <View key={date} style={styles.barWrapper}>
                    <Text style={styles.barCount}>
                      {total === 0 ? "" : `${completed}/${total}`}
                    </Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: barHeight,
                            backgroundColor:
                              completed === total && total > 0
                                ? colors.primary
                                : colors.primaryMuted,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.barLabel, isToday && styles.barLabelToday]}
                    >
                      {period === "7"
                        ? DAY_NAMES[parseDateKey(date).getDay()]
                        : parseDateKey(date).getDate()}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Per Habit Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Per Habit</Text>
          {habits.length === 0 && (
            <Text style={styles.emptyText}>Belum ada habit</Text>
          )}
          {habits.map((habit) => {
            const rate = getCompletionRate(habit);
            const streak = getCurrentStreak(habit);
            return (
              <View key={habit.id} style={styles.habitStatCard}>
                {/* Header habit */}
                <View style={styles.habitStatHeader}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: habit.color + "22" },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>{habit.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.habitStatName}>{habit.name}</Text>
                    <Text style={styles.habitStatDays}>
                      {habit.days.map((d) => DAY_NAMES[d]).join(", ")}
                    </Text>
                  </View>
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>🔥 {streak}</Text>
                  </View>
                </View>

                {/* Progress bar completion rate */}
                <View style={styles.rateRow}>
                  <View style={styles.rateBarTrack}>
                    <View
                      style={[
                        styles.rateBarFill,
                        {
                          width: `${rate}%`,
                          backgroundColor: habit.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.rateText}>{rate}%</Text>
                </View>

                {/* Heatmap per habit */}
                <Heatmap
                  getValue={(date) =>
                    isActiveDay(habit, date)
                      ? isCompleted(habit.id, date)
                        ? 1
                        : 0
                      : null
                  }
                  color={habit.color}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    backBtn: { width: 80 },
    backText: { fontSize: 14, color: c.primary, fontWeight: "600" },
    headerTitle: { fontSize: 18, fontWeight: "700", color: c.text },
    periodToggle: {
      flexDirection: "row",
      margin: 16,
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 4,
    },
    periodBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 10,
    },
    periodBtnActive: { backgroundColor: c.primary },
    periodText: { fontSize: 14, fontWeight: "600", color: c.textMuted },
    periodTextActive: { color: c.onPrimary },
    section: {
      marginHorizontal: 16,
      marginBottom: 20,
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: c.text,
      marginBottom: 16,
    },
    chartContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 6,
      paddingBottom: 4,
    },
    barWrapper: { alignItems: "center", width: 36 },
    barCount: { fontSize: 9, color: c.textMuted, marginBottom: 4 },
    barTrack: {
      width: 24,
      height: 120,
      justifyContent: "flex-end",
      backgroundColor: c.surfaceAlt,
      borderRadius: 6,
      overflow: "hidden",
    },
    barFill: { width: "100%", borderRadius: 6 },
    barLabel: { fontSize: 10, color: c.textMuted, marginTop: 6 },
    barLabelToday: { color: c.primary, fontWeight: "700" },
    habitStatCard: {
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    habitStatHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    habitStatName: { fontSize: 14, fontWeight: "600", color: c.text },
    habitStatDays: { fontSize: 11, color: c.textMuted, marginTop: 2 },
    streakBadge: {
      backgroundColor: c.streakBg,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
    },
    streakText: { fontSize: 12, fontWeight: "600", color: c.streakText },
    rateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    rateBarTrack: {
      flex: 1,
      height: 6,
      backgroundColor: c.surfaceAlt,
      borderRadius: 3,
      overflow: "hidden",
    },
    rateBarFill: { height: "100%", borderRadius: 3 },
    rateText: { fontSize: 12, fontWeight: "700", color: c.text, width: 36 },
    emptyText: { color: c.textMuted, fontSize: 13, textAlign: "center" },
  });
