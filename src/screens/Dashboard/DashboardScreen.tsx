import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Feather } from "@expo/vector-icons";

import { useFinanceStore } from "../../store/financeStore";
import { RootStackParamList } from "../../types";
import { monthlyData } from "../../data/mockData";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useCurrency } from "../../hooks/useCurrency";

import SummaryCard from "../../components/cards/SummaryCard";
import TransactionItem from "../../components/cards/TransactionItem";
import FloatingActionButton from "../../components/ui/FloatingActionButton";
import {
  SkeletonCard,
  SkeletonTransactionItem,
} from "../../components/ui/SkeletonLoader";
import { LineChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

type NavProp = StackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavProp>();
  const COLORS = useThemeColors();
  const { format } = useCurrency();
  const {
    transactions,
    totalBalance,
    totalIncome,
    totalExpenses,
    isLoading,
    loadData,
    deleteTransaction,
    profile,
  } = useFinanceStore();
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1500);
  };

  const recentTransactions = transactions.slice(0, 5);

  const chartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        data: monthlyData.map((d) => d.income),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 2.5,
      },
      {
        data: monthlyData.map((d) => d.expenses),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        strokeWidth: 2.5,
      },
    ],
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: COLORS.dark }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={COLORS.dark === "#0F0F1A" ? "light-content" : "dark-content"}
        backgroundColor={COLORS.dark}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerAnim }]}>
          <View>
            <Text style={[styles.greeting, { color: COLORS.textMuted }]}>
              Good Morning 👋
            </Text>
            <Text style={[styles.userName, { color: COLORS.textPrimary }]}>
              {profile.name}
            </Text>
          </View>
          <View
            style={[
              styles.notificationBtn,
              {
                backgroundColor: COLORS.darkCard,
                borderColor: COLORS.darkBorder,
              },
            ]}
          >
            <Feather name="bell" size={22} color={COLORS.textSecondary} />
            <View
              style={[
                styles.notifDot,
                { backgroundColor: COLORS.danger, borderColor: COLORS.dark },
              ]}
            />
          </View>
        </Animated.View>

        {/* Balance Hero */}
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.glassCircle1} />
          <View style={styles.glassCircle2} />
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{format(totalBalance, 2)}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <View style={styles.balanceIconBg}>
                <Feather
                  name="arrow-down-circle"
                  size={16}
                  color={COLORS.success}
                />
              </View>
              <View>
                <Text style={styles.balanceItemLabel}>Income</Text>
                <Text style={styles.balanceItemAmount}>
                  {format(totalIncome)}
                </Text>
              </View>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <View
                style={[
                  styles.balanceIconBg,
                  { backgroundColor: `${COLORS.danger}30` },
                ]}
              >
                <Feather
                  name="arrow-up-circle"
                  size={16}
                  color={COLORS.danger}
                />
              </View>
              <View>
                <Text style={styles.balanceItemLabel}>Expenses</Text>
                <Text
                  style={[styles.balanceItemAmount, { color: COLORS.danger }]}
                >
                  {format(totalExpenses)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Summary Cards Horizontal Scroll */}
        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>
          Overview
        </Text>
        {isLoading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardsScroll}
          >
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardsScroll}
            contentContainerStyle={styles.cardsContent}
          >
            <SummaryCard
              title="Income"
              amount={totalIncome}
              change={12.5}
              gradient={[COLORS.success, "#059669"]}
              icon="trending-up"
            />
            <SummaryCard
              title="Expenses"
              amount={totalExpenses}
              change={-5.2}
              gradient={[COLORS.danger, "#DC2626"]}
              icon="trending-down"
            />
            <SummaryCard
              title="Savings"
              amount={totalBalance * 0.3}
              change={8.1}
              gradient={[COLORS.primary, COLORS.secondary]}
              icon="pie-chart"
            />
            <SummaryCard
              title="Investments"
              amount={550}
              change={15.3}
              gradient={[COLORS.info, "#2563EB"]}
              icon="bar-chart-2"
            />
          </ScrollView>
        )}

        {/* Monthly Chart */}
        <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>
          Monthly Overview
        </Text>
        <Animated.View
          style={[
            styles.chartCard,
            {
              opacity: fadeAnim,
              backgroundColor: COLORS.darkCard,
              borderColor: COLORS.darkBorder,
            },
          ]}
        >
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: COLORS.success }]}
              />
              <Text style={[styles.legendText, { color: COLORS.textMuted }]}>
                Income
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: COLORS.danger }]}
              />
              <Text style={[styles.legendText, { color: COLORS.textMuted }]}>
                Expense
              </Text>
            </View>
          </View>
          {!isLoading && (
            <LineChart
              data={chartData}
              width={width - 64}
              height={180}
              chartConfig={{
                backgroundGradientFrom: COLORS.darkCard,
                backgroundGradientFromOpacity: 0,
                backgroundGradientTo: COLORS.darkCard,
                backgroundGradientToOpacity: 0,
                color: (opacity = 1) => `rgba(99,102,241,${opacity})`,
                strokeWidth: 2.5,
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: COLORS.primary,
                },
                propsForLabels: { fontSize: 11, fill: COLORS.textMuted },
                propsForBackgroundLines: {
                  stroke: COLORS.darkBorder,
                  strokeDasharray: "4",
                },
                decimalPlaces: 0,
                useShadowColorFromDataset: false,
              }}
              bezier
              withInnerLines
              withOuterLines={false}
              withShadow={false}
              style={{ marginLeft: -16, borderRadius: 16 }}
            />
          )}
        </Animated.View>

        {/* Recent Transactions */}
        <View style={styles.recentHeader}>
          <Text style={[styles.sectionTitle, { color: COLORS.textPrimary }]}>
            Recent Transactions
          </Text>
          <Text
            style={[styles.seeAll, { color: COLORS.primary }]}
            onPress={() => navigation.navigate("MainTabs" as any)}
          >
            See all
          </Text>
        </View>

        {isLoading ? (
          <>
            <SkeletonTransactionItem />
            <SkeletonTransactionItem />
            <SkeletonTransactionItem />
          </>
        ) : recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color={COLORS.textMuted} />
            <Text style={[styles.emptyText, { color: COLORS.textMuted }]}>
              No transactions yet
            </Text>
          </View>
        ) : (
          recentTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onDelete={deleteTransaction}
              showDelete={false}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FloatingActionButton
        onPress={() => navigation.navigate("AddTransaction", {})}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  balanceCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    overflow: "hidden",
    position: "relative",
  },
  glassCircle1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -40,
    right: -30,
  },
  glassCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: -20,
    left: 20,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 24,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balanceIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `rgba(16,185,129,0.25)`,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceItemLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "500",
  },
  balanceItemAmount: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
    marginTop: 4,
  },
  cardsScroll: {
    marginBottom: 24,
    marginHorizontal: -20,
    paddingLeft: 20,
  },
  cardsContent: {
    paddingRight: 20,
  },
  chartCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  chartLegend: {
    flexDirection: "row",
    marginBottom: 12,
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
    fontSize: 13,
    fontWeight: "600",
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
