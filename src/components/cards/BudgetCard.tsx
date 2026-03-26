import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Budget } from "../../types";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useCurrency } from "../../hooks/useCurrency";

interface BudgetCardProps {
  budget: Budget;
}

export default function BudgetCard({ budget }: BudgetCardProps) {
  const COLORS = useThemeColors();
  const { format } = useCurrency();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
  const isExceeded = budget.spent > budget.limit;
  const isWarning = percentage >= 80;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: percentage / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const iconName = budget.icon as keyof typeof Feather.glyphMap;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: COLORS.darkCard, borderColor: COLORS.darkBorder },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBg, { backgroundColor: `${budget.color}20` }]}>
          <Feather name={iconName} size={18} color={budget.color} />
        </View>
        <View style={styles.titleGroup}>
          <Text style={[styles.category, { color: COLORS.textPrimary }]}>
            {budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}
          </Text>
          <View style={styles.amountRow}>
            <Text
              style={[
                styles.spent,
                { color: isExceeded ? COLORS.danger : COLORS.textPrimary },
              ]}
            >
              {format(budget.spent, 0)}
            </Text>
            <Text style={[styles.limit, { color: COLORS.textMuted }]}>
              {" "}
              / {format(budget.limit, 0)}
            </Text>
          </View>
        </View>
        {isExceeded && (
          <View
            style={[styles.badge, { backgroundColor: `${COLORS.danger}20` }]}
          >
            <Text style={[styles.badgeText, { color: COLORS.danger }]}>
              Over
            </Text>
          </View>
        )}
        {!isExceeded && isWarning && (
          <View
            style={[
              styles.badge,
              styles.warningBadge,
              { backgroundColor: `${COLORS.warning}20` },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                styles.warningText,
                { color: COLORS.warning },
              ]}
            >
              ⚠️
            </Text>
          </View>
        )}
        <Text style={[styles.percentage, { color: COLORS.textSecondary }]}>
          {percentage.toFixed(0)}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        style={[styles.progressTrack, { backgroundColor: COLORS.darkSurface }]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: isExceeded
                ? COLORS.danger
                : isWarning
                  ? COLORS.warning
                  : budget.color,
            },
          ]}
        />
      </View>

      {/* Remaining */}
      <Text style={[styles.remaining, { color: COLORS.textMuted }]}>
        {isExceeded
          ? `${format(budget.spent - budget.limit, 2)} over budget`
          : `${format(budget.limit - budget.spent, 2)} remaining`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleGroup: {
    flex: 1,
  },
  category: {
    fontSize: 14,
    fontWeight: "700",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 2,
  },
  spent: {
    fontSize: 14,
    fontWeight: "700",
  },
  limit: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  warningBadge: {},
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  warningText: {},
  percentage: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 38,
    textAlign: "right",
  },
  progressTrack: {
    height: 8,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
  },
  remaining: {
    fontSize: 12,
    fontWeight: "500",
  },
});
