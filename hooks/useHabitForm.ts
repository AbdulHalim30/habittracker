import { useState } from "react";
import { Habit, TimeOfDay } from "../types";
import { ICONS, COLORS } from "../constants/data";
import {
  DEFAULT_REMINDER,
  ensureNotificationPermission,
} from "../utils/notifications";

const DEFAULT_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function useHabitForm() {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [days, setDays] = useState<number[]>(DEFAULT_DAYS);
  const [time, setTime] = useState<TimeOfDay>("all");
  const [reminder, setReminder] = useState<string | null>(null);

  function reset() {
    setName("");
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setDays(DEFAULT_DAYS);
    setTime("all");
    setReminder(null);
  }

  function prefill(habit: Habit) {
    setName(habit.name);
    setIcon(habit.icon);
    setColor(habit.color);
    setDays(habit.days);
    setTime(habit.time ?? "all");
    setReminder(habit.reminder ?? null);
  }

  // Minta izin notifikasi saat pengingat diaktifkan.
  // Mengembalikan false kalau izin ditolak.
  async function toggleReminder(enabled: boolean): Promise<boolean> {
    if (!enabled) {
      setReminder(null);
      return true;
    }
    const granted = await ensureNotificationPermission();
    if (granted) setReminder(DEFAULT_REMINDER[time]);
    return granted;
  }

  function toggleDay(day: number) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return {
    name,
    setName,
    icon,
    setIcon,
    color,
    setColor,
    days,
    toggleDay,
    time,
    setTime,
    reminder,
    setReminder,
    toggleReminder,
    reset,
    prefill,
  };
}
