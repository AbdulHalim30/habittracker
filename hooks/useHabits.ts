import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { AppState } from "react-native";
import { Habit, HabitLog, TimeOfDay } from "../types";
import { parseDateKey } from "../utils/date";
import { syncReminders } from "../utils/notifications";

const HABITS_KEY = "habits";
const LOGS_KEY = "habit_logs";

export function useHabits(selectedDate: string) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [remindersBlocked, setRemindersBlocked] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Susun ulang pengingat tiap habit/log berubah dan tiap aplikasi kembali aktif
  // (hari berganti, atau izin notifikasi diubah dari pengaturan)
  useEffect(() => {
    if (!loaded) return;
    const sync = () =>
      syncReminders(habits, logs)
        .then((ok) => setRemindersBlocked(!ok))
        .catch(() => {});
    sync();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") sync();
    });
    return () => sub.remove();
  }, [loaded, habits, logs]);

  async function loadData() {
    const habitsJson = await AsyncStorage.getItem(HABITS_KEY);
    const logsJson = await AsyncStorage.getItem(LOGS_KEY);
    if (habitsJson) setHabits(JSON.parse(habitsJson));
    if (logsJson) setLogs(JSON.parse(logsJson));
    setLoaded(true);
  }

  // Filter habit berdasarkan hari dari selectedDate
  const dayOfWeek = parseDateKey(selectedDate).getDay(); // 0-6
  const filteredHabits = habits
    .filter((h) => h.days.includes(dayOfWeek))
    .sort((a, b) => {
      const aCompleted = logs.some(
        (l) => l.habitId === a.id && l.date === selectedDate && l.completed
      );
      const bCompleted = logs.some(
        (l) => l.habitId === b.id && l.date === selectedDate && l.completed
      );
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      return 0;
    });

  async function addHabit(
    name: string,
    icon: string,
    color: string,
    days: number[],
    time: TimeOfDay,
    reminder: string | null
  ) {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      icon,
      color,
      days,
      time,
      reminder,
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  }

  async function deleteHabit(habitId: string) {
    const updated = habits.filter((h) => h.id !== habitId);
    const updatedLogs = logs.filter((l) => l.habitId !== habitId);
    setHabits(updated);
    setLogs(updatedLogs);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
  }

  async function toggleHabit(habitId: string) {
    const existing = logs.find(
      (l) => l.habitId === habitId && l.date === selectedDate
    );
    let updated: HabitLog[];
    if (existing) {
      updated = logs.map((l) =>
        l.habitId === habitId && l.date === selectedDate
          ? { ...l, completed: !l.completed }
          : l
      );
    } else {
      updated = [...logs, { habitId, date: selectedDate, completed: true }];
    }
    setLogs(updated);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  }

  function isCompleted(habitId: string) {
    return logs.some(
      (l) => l.habitId === habitId && l.date === selectedDate && l.completed
    );
  }

  async function updateHabit(
    id: string,
    name: string,
    icon: string,
    color: string,
    days: number[],
    time: TimeOfDay,
    reminder: string | null
  ) {
    const updated = habits.map((h) =>
      h.id === id ? { ...h, name, icon, color, days, time, reminder } : h
    );
    setHabits(updated);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  }

  return {
    habits: filteredHabits,
    allHabits: habits,
    logs,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    isCompleted,
    remindersBlocked,
  };
}
