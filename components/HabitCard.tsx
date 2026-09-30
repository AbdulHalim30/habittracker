import { useRef, useEffect } from "react";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Habit } from "../types";
import { Colors, useTheme, useThemedStyles } from "../constants/theme";

type Props = {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
};

export default function HabitCard({
  habit,
  completed,
  onToggle,
  onDelete,
  onEdit,
}: Props) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(completed ? 1 : 0)).current;
  const bgColor = useRef(new Animated.Value(completed ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(bgColor, {
      toValue: completed ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // wajib false untuk backgroundColor
    }).start();

    Animated.spring(checkScale, {
      toValue: completed ? 1 : 0,
      useNativeDriver: true,
      damping: 10,
      stiffness: 300,
    } as any).start();
  }, [completed]);

  function handleToggle() {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
        damping: 10,
        stiffness: 400,
      } as any),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 8,
        stiffness: 300,
      } as any),
    ]).start();

    onToggle();
  }

  const backgroundColor = bgColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.completedCard],
  });

  return (
    <Animated.View style={[styles.cardWrapper, { backgroundColor }]}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <TouchableOpacity
          style={styles.left}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <View
            style={[styles.iconBox, { backgroundColor: habit.color + "22" }]}
          >
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>
          <View>
            <Text style={[styles.name, completed && styles.nameCompleted]}>
              {habit.name}
            </Text>
            <Text style={styles.status}>
              {completed ? "Selesai hari ini" : "Belum selesai"}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.right}>
          <Animated.View
            style={[
              styles.checkCircle,
              { backgroundColor: habit.color },
              { transform: [{ scale: checkScale }], opacity: checkScale },
            ]}
          >
            <Text style={styles.checkText}>✓</Text>
          </Animated.View>

          {!completed && <View style={styles.emptyCircle} />}

          {/* Tombol Edit */}
          <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
            <Text style={styles.editText}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    cardWrapper: {
      borderRadius: 16,
      marginHorizontal: 16,
      marginVertical: 6,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 16,
      padding: 16,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    icon: { fontSize: 22 },
    name: {
      fontSize: 15,
      fontWeight: "600",
      color: c.text,
    },
    nameCompleted: {
      textDecorationLine: "line-through",
      color: c.textMuted,
    },
    status: {
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
    },
    right: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    checkCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
    checkText: {
      color: c.onPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    emptyCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: c.control,
    },
    deleteBtn: { padding: 4 },
    deleteText: { fontSize: 14, color: c.textFaint },
    editBtn: { padding: 4 },
    editText: { fontSize: 14 },
  });
