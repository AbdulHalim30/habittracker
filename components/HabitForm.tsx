import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { TimeOfDay } from "../types";
import { ICONS, COLORS, TIME_OPTIONS } from "../constants/data";
import { parseReminder, formatReminder } from "../utils/notifications";
import { Colors, useTheme, useThemedStyles } from "../constants/theme";

type Props = {
  // Mode
  mode: "create" | "edit";
  // Field values
  name: string;
  icon: string;
  color: string;
  days: number[];
  time: TimeOfDay;
  reminder: string | null;
  // Setters
  onChangeName: (v: string) => void;
  onChangeIcon: (v: string) => void;
  onChangeColor: (v: string) => void;
  onToggleDay: (day: number) => void;
  onChangeTime: (v: TimeOfDay) => void;
  onToggleReminder: (enabled: boolean) => Promise<boolean>;
  onChangeReminder: (v: string) => void;
  // Actions
  onSubmit: () => void;
  onCancel: () => void;
};

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const MINUTE_STEP = 5;

export default function HabitForm({
  mode,
  name,
  icon,
  color,
  days,
  time,
  reminder,
  onChangeName,
  onChangeIcon,
  onChangeColor,
  onToggleDay,
  onChangeTime,
  onToggleReminder,
  onChangeReminder,
  onSubmit,
  onCancel,
}: Props) {
  const styles = useThemedStyles(makeStyles);
  const { isDark, colors } = useTheme();
  async function handleToggleReminder(enabled: boolean) {
    const ok = await onToggleReminder(enabled);
    if (!ok) {
      Alert.alert(
        "Izin notifikasi ditolak",
        "Aktifkan notifikasi untuk aplikasi ini di pengaturan perangkat."
      );
    }
  }

  function shiftReminder(deltaMinutes: number) {
    if (!reminder) return;
    const { hour, minute } = parseReminder(reminder);
    const total = (hour * 60 + minute + deltaMinutes + 24 * 60) % (24 * 60);
    onChangeReminder(formatReminder(Math.floor(total / 60), total % 60));
  }

  return (
    <ScrollView
      style={{ maxHeight: "90%" }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <Text style={styles.title}>
          {mode === "create" ? "Habit Baru" : "Edit Habit"}
        </Text>

        {/* Nama */}
        <TextInput
          style={styles.input}
          placeholder="Nama habit..."
          placeholderTextColor={colors.textMuted}
          keyboardAppearance={isDark ? "dark" : "light"}
          value={name}
          onChangeText={onChangeName}
          autoFocus
        />

        {/* Icon */}
        <Text style={styles.label}>Pilih Icon</Text>
        <ScrollView
          style={{ maxHeight: 160 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <View style={styles.iconRow}>
            {ICONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                onPress={() => onChangeIcon(ic)}
                style={[
                  styles.iconOption,
                  icon === ic && styles.iconOptionSelected,
                ]}
              >
                <Text style={{ fontSize: 22 }}>{ic}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Warna */}
        <Text style={styles.label}>Pilih Warna</Text>
        <ScrollView
          style={{ maxHeight: 110 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <View style={styles.colorRow}>
            {COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => onChangeColor(c)}
                style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  color === c && styles.colorOptionSelected,
                ]}
              />
            ))}
          </View>
        </ScrollView>

        {/* Waktu */}
        <Text style={styles.label}>Waktu</Text>
        <View style={styles.timeRow}>
          {TIME_OPTIONS.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => onChangeTime(t.key)}
              style={[
                styles.timeOption,
                time === t.key && styles.timeOptionSelected,
              ]}
            >
              <Text style={styles.timeIcon}>{t.icon}</Text>
              <Text
                style={[
                  styles.timeLabel,
                  time === t.key && styles.timeLabelSelected,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hari */}
        <Text style={styles.label}>Aktif di hari</Text>
        <View style={styles.daysRow}>
          {DAY_LABELS.map((day, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onToggleDay(index)}
              style={[
                styles.dayOption,
                days.includes(index) && styles.dayOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  days.includes(index) && styles.dayTextSelected,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pengingat */}
        <View style={styles.reminderHeader}>
          <Text style={[styles.label, { marginBottom: 0 }]}>Pengingat</Text>
          <Switch
            value={reminder !== null}
            onValueChange={handleToggleReminder}
            trackColor={{ true: colors.primary }}
          />
        </View>
        {reminder !== null && (
          <View style={styles.reminderRow}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => shiftReminder(-60)}
            >
              <Text style={styles.stepText}>-1j</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => shiftReminder(-MINUTE_STEP)}
            >
              <Text style={styles.stepText}>-{MINUTE_STEP}m</Text>
            </TouchableOpacity>
            <Text style={styles.reminderTime}>{reminder}</Text>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => shiftReminder(MINUTE_STEP)}
            >
              <Text style={styles.stepText}>+{MINUTE_STEP}m</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => shiftReminder(60)}
            >
              <Text style={styles.stepText}>+1j</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 24 }} />

        {/* Buttons */}
        <TouchableOpacity style={styles.submitBtn} onPress={onSubmit}>
          <Text style={styles.submitBtnText}>
            {mode === "create" ? "Tambah Habit" : "Simpan Perubahan"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    content: { padding: 24, paddingTop: 8 },
    title: { fontSize: 18, fontWeight: "700", color: c.text, marginBottom: 16 },
    input: {
      borderWidth: 1,
      borderColor: c.borderStrong,
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      color: c.text,
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: c.textSecondary,
      marginBottom: 8,
    },
    iconRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    iconOption: {
      padding: 8,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "transparent",
    },
    iconOptionSelected: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    colorRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 24,
    },
    colorOption: { width: 32, height: 32, borderRadius: 16 },
    colorOptionSelected: { borderWidth: 3, borderColor: c.text },
    timeRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
    timeOption: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: c.borderStrong,
      backgroundColor: c.surfaceSubtle,
    },
    timeOptionSelected: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
    },
    timeIcon: { fontSize: 18, marginBottom: 4 },
    timeLabel: { fontSize: 11, fontWeight: "600", color: c.textMuted },
    timeLabelSelected: { color: c.primary },
    daysRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    dayOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: c.borderStrong,
      justifyContent: "center",
      alignItems: "center",
    },
    dayOptionSelected: { backgroundColor: c.primary, borderColor: c.primary },
    dayText: { fontSize: 11, fontWeight: "600", color: c.textMuted },
    dayTextSelected: { color: c.onPrimary },
    reminderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    reminderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    reminderTime: {
      fontSize: 22,
      fontWeight: "700",
      color: c.text,
      fontVariant: ["tabular-nums"],
    },
    stepBtn: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: c.borderStrong,
      backgroundColor: c.surfaceSubtle,
    },
    stepText: { fontSize: 12, fontWeight: "600", color: c.primary },
    submitBtn: {
      backgroundColor: c.primary,
      padding: 16,
      borderRadius: 14,
      alignItems: "center",
      marginBottom: 10,
    },
    submitBtnText: { color: c.onPrimary, fontWeight: "700", fontSize: 15 },
    cancelBtn: { alignItems: "center", padding: 8, marginBottom: 16 },
    cancelBtnText: { color: c.textMuted, fontSize: 14 },
  });
