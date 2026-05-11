import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { SafeAreaView } from "react-native-safe-area-context";

import { useHabits } from "./hooks/useHabits";
import { useHabitForm } from "./hooks/useHabitForm";

import DateSlider from "./components/DateSlider";
import TimeTabBar from "./components/TimeTabBar";
import HabitList from "./components/HabitList";
import HabitForm from "./components/HabitForm";
import StatsScreen from "./components/StatsScreen";
import BottomSheetModal from "./components/BottomSheetModal";

import { Habit, TimeOfDay } from "./types";

const TODAY = new Date().toISOString().split("T")[0];
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function App() {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [activeTab, setActiveTab] = useState<TimeOfDay>("all");
  const [showStats, setShowStats] = useState(false);

  // Modals
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Forms
  const createForm = useHabitForm();
  const editForm = useHabitForm();

  // Confetti
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useRef<any>(null);
  const prevCompletedAll = useRef(false);

  const {
    habits,
    logs,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    isCompleted,
  } = useHabits(selectedDate);

  const visibleHabits = habits.filter((h) =>
    activeTab === "all" ? true : h.time === activeTab || h.time === "all"
  );
  const completedCount = visibleHabits.filter((h) => isCompleted(h.id)).length;
  const allCompleted =
    visibleHabits.length > 0 && completedCount === visibleHabits.length;

  useEffect(() => {
    if (allCompleted && !prevCompletedAll.current) {
      setShowConfetti(true);
      confettiRef.current?.start();
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevCompletedAll.current = allCompleted;
  }, [allCompleted]);

  function handleCreate() {
    if (!createForm.name.trim() || createForm.days.length === 0) return;
    addHabit(
      createForm.name.trim(),
      createForm.icon,
      createForm.color,
      createForm.days,
      createForm.time
    );
    createForm.reset();
    setCreateVisible(false);
  }

  function handleOpenEdit(habit: Habit) {
    setEditingHabit(habit);
    editForm.prefill(habit);
    setEditVisible(true);
  }

  function handleSaveEdit() {
    if (!editingHabit || !editForm.name.trim() || editForm.days.length === 0)
      return;
    updateHabit(
      editingHabit.id,
      editForm.name.trim(),
      editForm.icon,
      editForm.color,
      editForm.days,
      editForm.time
    );
    setEditVisible(false);
    setEditingHabit(null);
  }

  if (showStats) {
    return (
      <StatsScreen
        habits={habits}
        logs={logs}
        onClose={() => setShowStats(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
          autoStart
          fadeOut
          explosionSpeed={350}
          fallSpeed={3000}
          colors={["#6C63FF", "#FF6584", "#43C6AC", "#F7971E", "#12c2e9"]}
        />
      )}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Habit Tracker</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.statsBtn}
            onPress={() => setShowStats(true)}
          >
            <Text style={{ fontSize: 16 }}>📊</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => setCreateVisible(true)}
          >
            <Text style={styles.createBtnText}>+ Buat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <DateSlider selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <TimeTabBar selected={activeTab} onSelect={setActiveTab} />

      {visibleHabits.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / visibleHabits.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {allCompleted
              ? "🎉 Semua selesai!"
              : `${completedCount}/${visibleHabits.length} selesai`}
          </Text>
        </View>
      )}

      <HabitList
        habits={habits}
        activeTab={activeTab}
        selectedDate={selectedDate}
        isCompleted={isCompleted}
        onToggle={toggleHabit}
        onDelete={deleteHabit}
        onEdit={handleOpenEdit}
      />

      <BottomSheetModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
      >
        <HabitForm
          mode="create"
          name={createForm.name}
          icon={createForm.icon}
          color={createForm.color}
          days={createForm.days}
          time={createForm.time}
          onChangeName={createForm.setName}
          onChangeIcon={createForm.setIcon}
          onChangeColor={createForm.setColor}
          onToggleDay={createForm.toggleDay}
          onChangeTime={createForm.setTime}
          onSubmit={handleCreate}
          onCancel={() => setCreateVisible(false)}
        />
      </BottomSheetModal>

      <BottomSheetModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
      >
        <HabitForm
          mode="edit"
          name={editForm.name}
          icon={editForm.icon}
          color={editForm.color}
          days={editForm.days}
          time={editForm.time}
          onChangeName={editForm.setName}
          onChangeIcon={editForm.setIcon}
          onChangeColor={editForm.setColor}
          onToggleDay={editForm.toggleDay}
          onChangeTime={editForm.setTime}
          onSubmit={handleSaveEdit}
          onCancel={() => setEditVisible(false)}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#222" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  statsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  createBtn: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: { height: "100%", backgroundColor: "#6C63FF", borderRadius: 3 },
  progressText: { fontSize: 12, color: "#888", fontWeight: "500" },
});
