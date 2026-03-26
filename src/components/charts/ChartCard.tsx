import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";
import { COLORS } from "../../data/mockData";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 48;

const chartConfig = {
  backgroundGradientFrom: COLORS.darkCard,
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: COLORS.darkCard,
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  strokeWidth: 2.5,
  barPercentage: 0.6,
  useShadowColorFromDataset: true,
  propsForDots: {
    r: "5",
    strokeWidth: "2",
    stroke: COLORS.primary,
  },
  propsForLabels: {
    fontSize: 11,
    fill: COLORS.textMuted,
    fontWeight: "600",
  },
  propsForBackgroundLines: {
    stroke: COLORS.darkBorder,
    strokeWidth: 1,
    strokeDasharray: "4",
  },
  decimalPlaces: 0,
};

interface LineChartCardProps {
  title: string;
  labels: string[];
  incomeData: number[];
  expenseData: number[];
}

export function LineChartCard({
  title,
  labels,
  incomeData,
  expenseData,
}: LineChartCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.success }]}
          />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: COLORS.danger }]}
          />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
      </View>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: incomeData,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              strokeWidth: 2.5,
            },
            {
              data: expenseData,
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              strokeWidth: 2.5,
            },
          ],
        }}
        width={CHART_WIDTH}
        height={200}
        chartConfig={chartConfig}
        bezier
        withInnerLines={true}
        withOuterLines={false}
        withShadow={false}
        style={styles.chart}
      />
    </Animated.View>
  );
}

interface BarChartCardProps {
  title: string;
  labels: string[];
  data: number[];
}

export function BarChartCard({ title, labels, data }: BarChartCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <BarChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={CHART_WIDTH}
        height={200}
        chartConfig={{
          ...chartConfig,
          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
          fillShadowGradientFrom: COLORS.primary,
          fillShadowGradientTo: COLORS.secondary,
          fillShadowGradientOpacity: 1,
        }}
        style={styles.chart}
        showValuesOnTopOfBars
        withInnerLines={true}
        yAxisLabel="$"
        yAxisSuffix=""
      />
    </Animated.View>
  );
}

interface PieChartCardProps {
  title: string;
  data: Array<{
    name: string;
    amount: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
  }>;
}

export function PieChartCard({ title, data }: PieChartCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <PieChart
        data={data}
        width={CHART_WIDTH}
        height={200}
        chartConfig={chartConfig}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="20"
        absolute={false}
        style={styles.chart}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 12,
  },
  legend: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  chart: {
    marginLeft: -16,
    borderRadius: 16,
  },
});
