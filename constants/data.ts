import { TimeOfDay } from "../types";

export const ICONS = [
  // Kesehatan & Olahraga
  "💪",
  "🏃",
  "🚴",
  "🏊",
  "🧘",
  "🤸",
  "🏋️",
  "⚽",
  "🎾",
  "🥊",
  // Makanan & Minum
  "💧",
  "🥗",
  "🥤",
  "🍎",
  "🥦",
  "🍳",
  "☕",
  "🧃",
  "🫖",
  "🍱",
  // Belajar & Produktivitas
  "📚",
  "✍️",
  "🎯",
  "💻",
  "📝",
  "🔬",
  "📖",
  "🧠",
  "📊",
  "🗂️",
  // Hobi & Hiburan
  "🎸",
  "🎨",
  "🎮",
  "🎬",
  "📷",
  "🎵",
  "🎹",
  "✂️",
  "🧩",
  "🪴",
  // Kebiasaan Baik
  "😴",
  "🧹",
  "🪥",
  "💊",
  "🧴",
  "🫁",
  "❤️",
  "🙏",
  "😊",
  "⭐",
];

export const COLORS = [
  "#6C63FF",
  "#4A90D9",
  "#5B8DEF",
  "#7B61FF",
  "#3D5AF1",
  "#0EA5E9",
  "#43C6AC",
  "#10B981",
  "#34D399",
  "#06B6D4",
  "#14B8A6",
  "#22C55E",
  "#FF6584",
  "#F43F5E",
  "#FB7185",
  "#FF6B6B",
  "#F97316",
  "#FF6384",
  "#F7971E",
  "#FBBF24",
  "#F59E0B",
  "#FCD34D",
  "#FB923C",
  "#FDBA74",
  "#A78BFA",
  "#8B5CF6",
  "#C084FC",
  "#E879F9",
  "#F472B6",
  "#94A3B8",
];

export const TIME_OPTIONS: { key: TimeOfDay; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "🌀" },
  { key: "morning", label: "Morning", icon: "🌅" },
  { key: "afternoon", label: "Afternoon", icon: "☀️" },
  { key: "evening", label: "Evening", icon: "🌙" },
];

export const TIME_SECTIONS: { key: TimeOfDay; label: string; icon: string }[] =
  [
    { key: "all", label: "Anytime", icon: "🌀" },
    { key: "morning", label: "Morning", icon: "🌅" },
    { key: "afternoon", label: "Afternoon", icon: "☀️" },
    { key: "evening", label: "Evening", icon: "🌙" },
  ];

export function getSectionsForTab(tab: TimeOfDay) {
  if (tab === "all") return TIME_SECTIONS;
  return TIME_SECTIONS.filter((s) => s.key === tab || s.key === "all");
}
