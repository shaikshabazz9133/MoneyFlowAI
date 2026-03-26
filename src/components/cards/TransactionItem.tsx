import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
  PanResponder,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Transaction } from "../../types";
import { CATEGORY_COLORS, CATEGORY_ICONS, COLORS } from "../../data/mockData";
import { useCurrency } from "../../hooks/useCurrency";
import { useThemeColors } from "../../hooks/useThemeColors";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export default function TransactionItem({
  transaction,
  onPress,
  onDelete,
  showDelete = true,
}: TransactionItemProps) {
  const { format } = useCurrency();
  const THEME = useThemeColors();
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  let isSwipeOpen = false;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => showDelete,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        showDelete && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8,
      onPanResponderMove: (_, { dx }) => {
        if (dx < 0) {
          translateX.setValue(Math.max(dx, -80));
          deleteOpacity.setValue(Math.min(Math.abs(dx) / 80, 1));
        } else if (isSwipeOpen) {
          translateX.setValue(Math.min(dx - 80, 0));
        }
      },
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -40) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            friction: 8,
          }).start();
          Animated.timing(deleteOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }).start();
          isSwipeOpen = true;
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
          Animated.timing(deleteOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
          isSwipeOpen = false;
        }
      },
    }),
  ).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => onPress?.(transaction));
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete?.(transaction.id),
        },
      ],
    );
  };

  const iconName =
    (CATEGORY_ICONS[transaction.category] as keyof typeof Feather.glyphMap) ||
    "circle";
  const categoryColor =
    CATEGORY_COLORS[transaction.category] || THEME.textMuted;
  const isIncome = transaction.type === "income";
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.swipeContainer}>
      {/* Delete background */}
      <Animated.View
        style={[styles.deleteBackground, { opacity: deleteOpacity }]}
      >
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={20} color="#FFF" />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Transaction card */}
      <Animated.View
        style={[
          styles.itemWrapper,
          {
            backgroundColor: THEME.darkCard,
            transform: [{ translateX }, { scale: scaleAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.9}
          style={styles.item}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${categoryColor}20` },
            ]}
          >
            <Feather name={iconName} size={20} color={categoryColor} />
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text
              style={[styles.title, { color: THEME.textPrimary }]}
              numberOfLines={1}
            >
              {transaction.title}
            </Text>
            <View style={styles.meta}>
              <Text style={[styles.category, { color: THEME.textMuted }]}>
                {transaction.category.charAt(0).toUpperCase() +
                  transaction.category.slice(1)}
              </Text>
              <Text style={[styles.dot, { color: THEME.textMuted }]}>·</Text>
              <Text style={[styles.date, { color: THEME.textMuted }]}>
                {formattedDate}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <Text
            style={[
              styles.amount,
              { color: isIncome ? THEME.success : THEME.danger },
            ]}
          >
            {isIncome ? "+" : "-"}
            {format(Math.abs(transaction.amount), 2)}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    position: "relative",
    marginBottom: 8,
  },
  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: COLORS.danger,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  deleteText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  itemWrapper: {
    borderRadius: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
  },
  category: {
    fontSize: 12,
    fontWeight: "500",
  },
  dot: {
    marginHorizontal: 4,
  },
  date: {
    fontSize: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
});
