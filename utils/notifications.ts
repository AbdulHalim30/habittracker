// Pengingat lokal per habit, dijadwalkan per tanggal untuk beberapa hari ke depan.
// Jadwal mingguan tidak dipakai karena tidak bisa melewati satu hari tertentu,
// sedangkan pengingat untuk habit yang sudah dicentang harus dibatalkan.
// Jadwal disusun ulang tiap kali habit/log berubah dan tiap aplikasi dibuka.
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Habit, HabitLog, TimeOfDay } from "../types";
import { toDateKey } from "./date";

const CHANNEL_ID = "reminders";
const ID_PREFIX = "habit-";
const DAYS_AHEAD = 7;
// iOS hanya menyimpan 64 notifikasi terjadwal per aplikasi
const MAX_SCHEDULED = 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const DEFAULT_REMINDER: Record<TimeOfDay, string> = {
  all: "09:00",
  morning: "07:00",
  afternoon: "13:00",
  evening: "19:00",
};

// "HH:MM" -> { hour, minute }
export function parseReminder(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}

export function formatReminder(hour: number, minute: number): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(hour)}:${pad(minute)}`;
}

async function ensureChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Pengingat Habit",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function ensureNotificationPermission(): Promise<boolean> {
  await ensureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function cancelAllReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier.startsWith(ID_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

async function doSync(habits: Habit[], logs: HabitLog[]): Promise<boolean> {
  await cancelAllReminders();

  const withReminder = habits.filter((h) => h.reminder);
  if (withReminder.length === 0) return true;

  // Tidak meminta izin di sini; hanya form yang boleh memunculkan dialog izin
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return false;
  await ensureChannel();

  const done = new Set(
    logs.filter((l) => l.completed).map((l) => `${l.habitId}|${l.date}`)
  );
  const now = new Date();
  const upcoming: { habit: Habit; dateKey: string; at: Date }[] = [];

  for (let offset = 0; offset < DAYS_AHEAD; offset++) {
    const day = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset
    );
    const dateKey = toDateKey(day);
    for (const habit of withReminder) {
      if (!habit.days.includes(day.getDay())) continue;
      if (dateKey < toDateKey(new Date(habit.createdAt))) continue;
      if (done.has(`${habit.id}|${dateKey}`)) continue;
      const { hour, minute } = parseReminder(habit.reminder!);
      const at = new Date(day);
      at.setHours(hour, minute, 0, 0);
      if (at <= now) continue;
      upcoming.push({ habit, dateKey, at });
    }
  }

  upcoming.sort((a, b) => a.at.getTime() - b.at.getTime());
  await Promise.all(
    upcoming.slice(0, MAX_SCHEDULED).map(({ habit, dateKey, at }) =>
      Notifications.scheduleNotificationAsync({
        identifier: `${ID_PREFIX}${habit.id}-${dateKey}`,
        content: {
          title: `${habit.icon} ${habit.name}`,
          body: "Waktunya menjalankan habit ini!",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          channelId: CHANNEL_ID,
          date: at,
        },
      })
    )
  );
  return true;
}

// Sinkronisasi dijalankan berurutan: tiap run membatalkan semua lalu menjadwalkan
// ulang, jadi run yang tumpang tindih bisa meninggalkan notifikasi basi.
let queue: Promise<unknown> = Promise.resolve();

// Mengembalikan false kalau ada pengingat aktif tapi izin notifikasi tidak ada
export function syncReminders(
  habits: Habit[],
  logs: HabitLog[]
): Promise<boolean> {
  const run = queue.then(() => doSync(habits, logs));
  queue = run.catch(() => {});
  return run;
}
