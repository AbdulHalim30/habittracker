import { useState } from "react";
import { View, Text, StyleSheet, LayoutChangeEvent } from "react-native";
import { toDateKey, todayKey } from "../utils/date";
import { Colors, useTheme, useThemedStyles } from "../constants/theme";

type Props = {
  // null = hari tidak aktif, 0..1 = proporsi selesai
  getValue: (dateKey: string) => number | null;
  color: string;
  showLegend?: boolean;
};

const CELL = 12;
const GAP = 3;
const LABEL_WIDTH = 26;
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
// Label hanya di baris ganjil supaya tidak sesak, seperti GitHub
const ROW_LABELS = ["", "Sen", "", "Rab", "", "Jum", ""];
const ALPHA = ["", "55", "8C", "C4", ""]; // level 1..4, level 4 = warna penuh

function level(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 4;
  return Math.max(1, Math.ceil(value * 3));
}

function cellColor(value: number | null, color: string, theme: Colors): string {
  if (value === null) return theme.heatInactive;
  const l = level(value);
  return l === 0 ? theme.heatMissed : color + ALPHA[l];
}

// Kolom = minggu (Min..Sab), kolom terakhir = minggu ini
function buildWeeks(count: number): Date[][] {
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - today.getDay() - (count - 1) * 7
  );
  return Array.from({ length: count }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const offset = w * 7 + d;
      return new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + offset
      );
    })
  );
}

export default function Heatmap({ getValue, color, showLegend }: Props) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const weekCount = Math.max(
    1,
    // lebar = LABEL_WIDTH + n * (CELL + GAP), GAP ikut di belakang kolom label
    Math.floor((width - LABEL_WIDTH) / (CELL + GAP))
  );
  const weeks = width > 0 ? buildWeeks(weekCount) : [];
  const today = todayKey();

  // Label bulan di kolom pertama yang memuat tanggal 1..7 bulan itu,
  // dilewati kalau terlalu dekat dengan label sebelumnya
  let lastLabelCol = -Infinity;
  const monthLabels = weeks.map((week, i) => {
    const first = week[0];
    const isNewMonth = i === 0 || first.getDate() <= 7;
    if (!isNewMonth || i - lastLabelCol < 3) return "";
    lastLabelCol = i;
    return MONTH_NAMES[first.getMonth()];
  });

  return (
    <View onLayout={onLayout}>
      {weeks.length > 0 && (
        <>
          <View style={[styles.row, { marginLeft: LABEL_WIDTH + GAP }]}>
            {monthLabels.map((label, i) => (
              <View key={i} style={styles.monthCell}>
                {label !== "" && (
                  <Text style={styles.monthText} numberOfLines={1}>
                    {label}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ width: LABEL_WIDTH }}>
              {ROW_LABELS.map((label, i) => (
                <Text key={i} style={styles.dayText}>
                  {label}
                </Text>
              ))}
            </View>
            {weeks.map((week, w) => (
              <View key={w} style={styles.column}>
                {week.map((date) => {
                  const key = toDateKey(date);
                  if (key > today) {
                    return <View key={key} style={styles.cell} />;
                  }
                  return (
                    <View
                      key={key}
                      style={[
                        styles.cell,
                        {
                          backgroundColor: cellColor(
                            getValue(key),
                            color,
                            colors
                          ),
                        },
                        key === today && styles.today,
                      ]}
                    />
                  );
                })}
              </View>
            ))}
          </View>

          {showLegend && (
            <View style={styles.legend}>
              <Text style={styles.legendText}>Kurang</Text>
              {[0, 0.2, 0.5, 0.8, 1].map((v) => (
                <View
                  key={v}
                  style={[
                    styles.cell,
                    { backgroundColor: cellColor(v, color, colors) },
                  ]}
                />
              ))}
              <Text style={styles.legendText}>Lebih</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: { flexDirection: "row", gap: GAP },
    column: { gap: GAP },
    cell: { width: CELL, height: CELL, borderRadius: 3 },
    today: { borderWidth: 1.5, borderColor: c.text },
    monthCell: { width: CELL, height: 14, overflow: "visible" },
    monthText: { fontSize: 9, color: c.textMuted, width: 30 },
    dayText: {
      fontSize: 9,
      color: c.textMuted,
      height: CELL,
      lineHeight: CELL,
      marginBottom: GAP,
    },
    legend: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: GAP,
      marginTop: 10,
    },
    legendText: { fontSize: 10, color: c.textMuted, marginHorizontal: 4 },
  });
