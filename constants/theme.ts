// Token warna untuk mode terang dan gelap. Mode mengikuti setelan sistem.
// Komponen membuat style lewat useThemedStyles(makeStyles) supaya ikut berganti.
import { useMemo } from "react";
import { StyleSheet, useColorScheme } from "react-native";

const light = {
  background: "#f5f5f5",
  surface: "#fff",
  surfaceAlt: "#f5f5f5",
  surfaceSubtle: "#fafafa",
  border: "#f0f0f0",
  borderStrong: "#eee",
  control: "#ddd",
  text: "#222",
  textSecondary: "#888",
  textMuted: "#aaa",
  textFaint: "#ccc",
  primary: "#6C63FF",
  primarySoft: "#6C63FF11",
  primaryMuted: "#B0ABFF",
  onPrimary: "#fff",
  completedCard: "#f0fff4",
  backdrop: "#00000055",
  warningBg: "#FFF4E5",
  warningBorder: "#FDE3BF",
  warningText: "#B45309",
  streakBg: "#FFF3E0",
  streakText: "#F57C00",
  heatMissed: "#e6e6ec",
  heatInactive: "#f7f7f9",
};

export type Colors = typeof light;

const dark: Colors = {
  background: "#0f0f14",
  surface: "#1a1a21",
  surfaceAlt: "#24242d",
  surfaceSubtle: "#202028",
  border: "#2a2a33",
  borderStrong: "#33333d",
  control: "#44444f",
  text: "#f2f2f5",
  textSecondary: "#a3a3ad",
  textMuted: "#7d7d88",
  textFaint: "#5a5a64",
  // Ungu sedikit lebih terang supaya kontras di latar gelap
  primary: "#8B84FF",
  primarySoft: "#8B84FF22",
  primaryMuted: "#4d4799",
  onPrimary: "#fff",
  completedCard: "#15261c",
  backdrop: "#00000099",
  warningBg: "#2d2210",
  warningBorder: "#4a3712",
  warningText: "#F5B35C",
  streakBg: "#33230f",
  streakText: "#FFA94D",
  heatMissed: "#2e2e38",
  heatInactive: "#202028",
};

export function useTheme() {
  const isDark = useColorScheme() === "dark";
  return { isDark, colors: isDark ? dark : light };
}

export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  makeStyles: (c: Colors) => T
): T {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors, makeStyles]);
}
