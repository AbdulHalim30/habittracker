export type TimeOfDay = "all" | "morning" | "afternoon" | "evening";

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  days: number[];
  time: TimeOfDay;
  reminder?: string | null; // "HH:MM", null/undefined = tanpa pengingat
  createdAt: string;
};

export type HabitLog = {
  habitId: string;
  date: string;
  completed: boolean;
};
