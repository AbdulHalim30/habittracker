import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { TimeOfDay } from "../types";
import { ICONS, COLORS, TIME_OPTIONS } from "../constants/data";

type Props = {
  // Mode
  mode: "create" | "edit";
  // Field values
  name: string;
  icon: string;
  color: string;
  days: number[];
  time: TimeOfDay;
  // Setters
  onChangeName: (v: string) => void;
  onChangeIcon: (v: string) => void;
  onChangeColor: (v: string) => void;
  onToggleDay: (day: number) => void;
  onChangeTime: (v: TimeOfDay) => void;
  // Actions
  onSubmit: () => void;
  onCancel: () => void;
};

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function HabitForm({
  mode,
  name,
  icon,
  color,
  days,
  time,
  onChangeName,
  onChangeIcon,
  onChangeColor,
  onToggleDay,
  onChangeTime,
  onSubmit,
  onCancel,
}: Props) {
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

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 8 },
  title: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#888", marginBottom: 8 },
  iconRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  iconOption: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconOptionSelected: { borderColor: "#6C63FF", backgroundColor: "#6C63FF11" },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  colorOption: { width: 32, height: 32, borderRadius: 16 },
  colorOptionSelected: { borderWidth: 3, borderColor: "#222" },
  timeRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  timeOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },
  timeOptionSelected: { borderColor: "#6C63FF", backgroundColor: "#6C63FF11" },
  timeIcon: { fontSize: 18, marginBottom: 4 },
  timeLabel: { fontSize: 11, fontWeight: "600", color: "#aaa" },
  timeLabelSelected: { color: "#6C63FF" },
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
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  dayOptionSelected: { backgroundColor: "#6C63FF", borderColor: "#6C63FF" },
  dayText: { fontSize: 11, fontWeight: "600", color: "#aaa" },
  dayTextSelected: { color: "#fff" },
  submitBtn: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { alignItems: "center", padding: 8, marginBottom: 16 },
  cancelBtnText: { color: "#aaa", fontSize: 14 },
});
