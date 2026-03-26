import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Goal } from "../../types";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useCurrency } from "../../hooks/useCurrency";

interface GoalCardProps {
  goal: Goal;
  onContribute?: (goal: Goal) => void;
}

export default function GoalCard({ goal, onContribute }: GoalCardProps) {
  const COLORS = useThemeColors();
  const { format } = useCurrency();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const percentage = Math.min(
    (goal.currentAmount / goal.targetAmount) * 100,
    100,
  );
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysLeft = Math.ceil(
    (new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: percentage / 100,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const iconName = goal.icon as keyof typeof Feather.glyphMap;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: COLORS.darkCard, borderColor: COLORS.darkBorder },
        ]}
        onPress={() => onContribute?.(goal)}
        activeOpacity={0.9}
      >
        {/* Top Gradient Line */}
        <LinearGradient
          colors={[goal.color, `${goal.color}44`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topLine}
        />

        <View style={styles.header}>
          <View style={[styles.iconBg, { backgroundColor: `${goal.color}20` }]}>
            <Feather name={iconName} size={22} color={goal.color} />
          </View>
          <View style={styles.titleWrapper}>
            <Text style={[styles.title, { color: COLORS.textPrimary }]}>
              {goal.title}
            </Text>
            <Text style={[styles.deadline, { color: COLORS.textMuted }]}>
              {daysLeft > 0 ? `${daysLeft} days left` : "Deadline passed"}
            </Text>
          </View>
          <View
            style={[
              styles.percentBadge,
              { backgroundColor: `${goal.color}20` },
            ]}
          >
            <Text style={[styles.percentText, { color: goal.color }]}>
              {percentage.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Amounts */}
        <View style={styles.amountRow}>
          <View>
            <Text style={[styles.amountLabel, { color: COLORS.textMuted }]}>
              Saved
            </Text>
            <Text style={[styles.amountValue, { color: goal.color }]}>
              {format(goal.currentAmount, 0)}
            </Text>
          </View>
          <View style={styles.amountCenter}>
            <Feather name="arrow-right" size={16} color={COLORS.textMuted} />
          </View>
          <View style={styles.amountRight}>
            <Text style={[styles.amountLabel, { color: COLORS.textMuted }]}>
              Target
            </Text>
            <Text style={[styles.amountValue, { color: COLORS.textPrimary }]}>
              {format(goal.targetAmount, 0)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: COLORS.darkSurface },
          ]}
        >
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor: goal.color,
              },
            ]}
          />
        </View>

        <Text style={[styles.remaining, { color: COLORS.textMuted }]}>
          {format(remaining, 0)} more to go
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 6,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 3,
  },
  deadline: {
    fontSize: 12,
    fontWeight: "500",
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  percentText: {
    fontSize: 13,
    fontWeight: "800",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  amountCenter: {
    flex: 1,
    alignItems: "center",
  },
  amountRight: {
    alignItems: "flex-end",
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  amountValue: {
    fontSize: 17,
    fontWeight: "800",
  },
  progressTrack: {
    height: 10,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  remaining: {
    fontSize: 12,
    fontWeight: "500",
  },
});
