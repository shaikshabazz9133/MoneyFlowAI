import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { Feather } from "@expo/vector-icons";

import { useFinanceStore } from "../../store/financeStore";
import { monthlyData, weeklyData, CATEGORY_COLORS } from "../../data/mockData";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useCurrency } from "../../hooks/useCurrency";

const { width } = Dimensions.get("window");
const CHART_W = width - 48;

type Period = "weekly" | "monthly";

export default function AnalyticsScreen() {
  const COLORS = useThemeColors();
  const { format, symbol } = useCurrency();
  const { transactions, totalIncome, totalExpenses } = useFinanceStore();
  const [period, setPeriod] = useState<Period>("monthly");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const chartConfig = {
    backgroundGradientFrom: COLORS.darkCard,
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: COLORS.darkCard,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    strokeWidth: 2.5,
    barPercentage: 0.65,
    useShadowColorFromDataset: false,
    propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.primary },
    propsForLabels: { fontSize: 10, fill: COLORS.textMuted },
    propsForBackgroundLines: {
      stroke: COLORS.darkBorder,
      strokeDasharray: "4",
    },
    decimalPlaces: 0,
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Build category breakdown for pie chart
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const pieData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, amount]) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      amount,
      color: CATEGORY_COLORS[cat] || COLORS.textMuted,
      legendFontColor: COLORS.textSecondary,
      legendFontSize: 12,
    }));

  const currentData = period === "monthly" ? monthlyData : weeklyData;
  const labels =
    period === "monthly"
      ? monthlyData.map((d) => d.month)
      : weeklyData.map((d) => d.day);
  const incomeDataset = currentData.map((d) => Math.max(d.income, 0));
  const expenseDataset = currentData.map((d) => Math.max(d.expenses, 0));
  const netDataset = currentData.map((d) => Math.max(d.income - d.expenses, 0));

  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: COLORS.dark }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={COLORS.dark === "#0F0F1A" ? "light-content" : "dark-content"}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <Text style={[styles.screenTitle, { color: COLORS.textPrimary }]}>
          Analytics
        </Text>

        {/* Period Toggle */}
        <View
          style={[
            styles.periodToggle,
            {
              backgroundColor: COLORS.darkCard,
              borderColor: COLORS.darkBorder,
            },
          ]}
        >
          {(["weekly", "monthly"] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: COLORS.textMuted },
                  period === p && styles.periodTextActive,
                ]}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Row */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: COLORS.darkCard,
                borderColor: `${COLORS.success}40`,
              },
            ]}
          >
            <Feather
              name="arrow-down-circle"
              size={20}
              color={COLORS.success}
            />
            <Text style={[styles.statAmount, { color: COLORS.textPrimary }]}>
              {format(totalIncome)}
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>
              Total Income
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: COLORS.darkCard,
                borderColor: `${COLORS.danger}40`,
              },
            ]}
          >
            <Feather name="arrow-up-circle" size={20} color={COLORS.danger} />
            <Text style={[styles.statAmount, { color: COLORS.danger }]}>
              {format(totalExpenses)}
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>
              Total Spent
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: COLORS.darkCard,
                borderColor: `${COLORS.primary}40`,
              },
            ]}
          >
            <Feather name="percent" size={20} color={COLORS.primary} />
            <Text style={[styles.statAmount, { color: COLORS.primary }]}>
              {savingsRate.toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, { color: COLORS.textMuted }]}>
              Savings Rate
            </Text>
          </View>
        </Animated.View>

        {/* Income vs Expense Line Chart */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: COLORS.darkCard,
              borderColor: COLORS.darkBorder,
            },
          ]}
        >
          <Text style={[styles.chartTitle, { color: COLORS.textPrimary }]}>
            Income vs Expenses
          </Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
              <Text
                style={[styles.legendText, { color: COLORS.textSecondary }]}
              >
                Income
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.danger }]} />
              <Text
                style={[styles.legendText, { color: COLORS.textSecondary }]}
              >
                Expenses
              </Text>
            </View>
          </View>
          <LineChart
            data={{
              labels,
              datasets: [
                {
                  data: incomeDataset,
                  color: (op = 1) => `rgba(16,185,129,${op})`,
                  strokeWidth: 2.5,
                },
                {
                  data: expenseDataset,
                  color: (op = 1) => `rgba(239,68,68,${op})`,
                  strokeWidth: 2.5,
                },
              ],
            }}
            width={CHART_W}
            height={200}
            chartConfig={chartConfig}
            bezier
            withInnerLines
            withOuterLines={false}
            withShadow={false}
            style={styles.chart}
          />
        </View>

        {/* Bar Chart - Monthly Spending */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: COLORS.darkCard,
              borderColor: COLORS.darkBorder,
            },
          ]}
        >
          <Text style={[styles.chartTitle, { color: COLORS.textPrimary }]}>
            Spending Breakdown
          </Text>
          <BarChart
            data={{
              labels,
              datasets: [{ data: expenseDataset }],
            }}
            width={CHART_W}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (op = 1) => `rgba(239,68,68,${op})`,
            }}
            style={styles.chart}
            showValuesOnTopOfBars={false}
            withInnerLines
            yAxisLabel={symbol}
            yAxisSuffix=""
          />
        </View>

        {/* Net Income Bar Chart */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: COLORS.darkCard,
              borderColor: COLORS.darkBorder,
            },
          ]}
        >
          <Text style={[styles.chartTitle, { color: COLORS.textPrimary }]}>
            Net Savings
          </Text>
          <BarChart
            data={{
              labels,
              datasets: [{ data: netDataset }],
            }}
            width={CHART_W}
            height={180}
            chartConfig={{
              ...chartConfig,
              color: (op = 1) => `rgba(99,102,241,${op})`,
            }}
            style={styles.chart}
            showValuesOnTopOfBars={false}
            withInnerLines
            yAxisLabel={symbol}
            yAxisSuffix=""
          />
        </View>

        {/* Pie Chart - Category Breakdown */}
        {pieData.length > 0 && (
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: COLORS.darkCard,
                borderColor: COLORS.darkBorder,
              },
            ]}
          >
            <Text style={[styles.chartTitle, { color: COLORS.textPrimary }]}>
              Spending by Category
            </Text>
            <PieChart
              data={pieData}
              width={CHART_W}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute={false}
              style={styles.chart}
            />
          </View>
        )}

        {/* Category breakdown list */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: COLORS.darkCard,
              borderColor: COLORS.darkBorder,
            },
          ]}
        >
          <Text style={[styles.chartTitle, { color: COLORS.textPrimary }]}>
            Category Details
          </Text>
          {Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([cat, amount]) => {
              const pct =
                totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              const color = CATEGORY_COLORS[cat] || COLORS.textMuted;
              return (
                <View key={cat} style={styles.categoryRow}>
                  <View
                    style={[styles.categoryDot, { backgroundColor: color }]}
                  />
                  <Text
                    style={[styles.categoryName, { color: COLORS.textPrimary }]}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                  <View
                    style={[
                      styles.categoryBar,
                      { backgroundColor: COLORS.darkBorder },
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryBarFill,
                        { width: `${pct}%` as any, backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryAmount,
                      { color: COLORS.textSecondary },
                    ]}
                  >
                    {format(amount)}
                  </Text>
                </View>
              );
            })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 20 },
  screenTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  periodToggle: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  periodBtnActive: {
    backgroundColor: "#6366F1",
  },
  periodText: {
    fontSize: 14,
    fontWeight: "700",
  },
  periodTextActive: {
    color: "#FFF",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  statAmount: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },
  chartCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chart: {
    marginLeft: -16,
    borderRadius: 16,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    width: 90,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  categoryBarFill: {
    height: "100%",
    borderRadius: 8,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: "700",
    width: 62,
    textAlign: "right",
  },
});
