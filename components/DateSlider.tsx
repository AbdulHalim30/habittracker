import { useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { parseDateKey, toDateKey, todayKey } from "../utils/date";

const ITEM_WIDTH = 56;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

function getDates(center: string, range = 30) {
  const dates = [];
  const centerDate = parseDateKey(center);
  for (let i = -range; i <= range; i++) {
    const d = new Date(centerDate);
    d.setDate(d.getDate() + i);
    dates.push(toDateKey(d));
  }
  return dates;
}

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
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

type Props = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export default function DateSlider({ selectedDate, onSelectDate }: Props) {
  const today = todayKey();
  const dates = getDates(today);
  const flatListRef = useRef<FlatList>(null);
  const selectedIndex = dates.indexOf(selectedDate);

  const selectedDateObj = parseDateKey(selectedDate);
  const monthYear = `${MONTH_NAMES[selectedDateObj.getMonth()]} ${selectedDateObj.getFullYear()}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedIndex]);

  return (
    <View style={styles.container}>
      <Text style={styles.monthYear}>{monthYear}</Text>
      <FlatList
        ref={flatListRef}
        data={dates}
        horizontal
        initialScrollIndex={selectedIndex}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => {
          const dateObj = parseDateKey(item);
          const dayName = DAY_NAMES[dateObj.getDay()];
          const dayNum = dateObj.getDate();
          const isSelected = item === selectedDate;
          const isToday = item === todayKey();

          return (
            <TouchableOpacity
              onPress={() => onSelectDate(item)}
              style={[styles.dateItem, isSelected && styles.dateItemSelected]}
            >
              <Text style={[styles.dayName, isSelected && styles.textSelected]}>
                {dayName}
              </Text>
              <Text style={[styles.dayNum, isSelected && styles.textSelected]}>
                {dayNum}
              </Text>
              {isToday && (
                <View style={[styles.dot, isSelected && styles.dotSelected]} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  monthYear: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    textAlign: "center",
    marginBottom: 8,
  },
  dateItem: {
    width: ITEM_WIDTH,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 16,
  },
  dateItemSelected: {
    backgroundColor: "#6C63FF",
  },
  dayName: {
    fontSize: 11,
    color: "#aaa",
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  textSelected: {
    color: "#fff",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6C63FF",
    marginTop: 4,
  },
  dotSelected: {
    backgroundColor: "#fff",
  },
});
