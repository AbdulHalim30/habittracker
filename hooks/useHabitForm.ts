import { useState } from "react";
import { Habit, TimeOfDay } from "../types";
import { ICONS, COLORS } from "../constants/data";

const DEFAULT_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function useHabitForm() {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICONS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [days, setDays] = useState<number[]>(DEFAULT_DAYS);
  const [time, setTime] = useState<TimeOfDay>("all");

  function reset() {
    setName("");
    setIcon(ICONS[0]);
    setColor(COLORS[0]);
    setDays(DEFAULT_DAYS);
    setTime("all");
  }

  function prefill(habit: Habit) {
    setName(habit.name);
    setIcon(habit.icon);
    setColor(habit.color);
    setDays(habit.days);
    setTime(habit.time ?? "all");
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
    reset,
    prefill,
  };
}
