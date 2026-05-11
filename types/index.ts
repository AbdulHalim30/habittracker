export type TimeOfDay = "all" | "morning" | "afternoon" | "evening";

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  days: number[];
  time: TimeOfDay;
  createdAt: string;
};

export type HabitLog = {
  habitId: string;
  date: string;
  completed: boolean;
};
