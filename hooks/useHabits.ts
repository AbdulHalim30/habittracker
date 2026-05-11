import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { Habit, HabitLog, TimeOfDay } from "../types";

const HABITS_KEY = "habits";
const LOGS_KEY = "habit_logs";

export function useHabits(selectedDate: string) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const habitsJson = await AsyncStorage.getItem(HABITS_KEY);
    const logsJson = await AsyncStorage.getItem(LOGS_KEY);
    if (habitsJson) setHabits(JSON.parse(habitsJson));
    if (logsJson) setLogs(JSON.parse(logsJson));
  }

  // Filter habit berdasarkan hari dari selectedDate
  const dayOfWeek = new Date(selectedDate).getDay(); // 0-6
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
    time: TimeOfDay
  ) {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      icon,
      color,
      days,
      time,
      createdAt: new Date().toISOString(),
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  }

  async function deleteHabit(habitId: string) {
    const updated = habits.filter((h) => h.id !== habitId);
    setHabits(updated);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
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
    time: TimeOfDay
  ) {
    const updated = habits.map((h) =>
      h.id === id ? { ...h, name, icon, color, days, time } : h
    );
    setHabits(updated);
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  }

  return {
    habits: filteredHabits,
    logs,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    isCompleted,
  };
}
