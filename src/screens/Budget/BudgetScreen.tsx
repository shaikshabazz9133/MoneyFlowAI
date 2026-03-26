import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useFinanceStore } from "../../store/financeStore";
import { TransactionCategory } from "../../types";
import { COLORS } from "../../data/mockData";
import { useCurrency } from "../../hooks/useCurrency";
import BudgetCard from "../../components/cards/BudgetCard";

const BUDGET_CATEGORIES: {
  key: TransactionCategory;
  label: string;
  icon: string;
}[] = [
  { key: "food", label: "Food", icon: "coffee" },
  { key: "transport", label: "Transport", icon: "navigation" },
  { key: "shopping", label: "Shopping", icon: "shopping-bag" },
  { key: "entertainment", label: "Entertainment", icon: "film" },
  { key: "health", label: "Health", icon: "heart" },
  { key: "bills", label: "Bills", icon: "file-text" },
  { key: "education", label: "Education", icon: "book" },
  { key: "travel", label: "Travel", icon: "map-pin" },
  { key: "other", label: "Other", icon: "more-horizontal" },
];

const BUDGET_COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F97316",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#14B8A6",
  "#EF4444",
];

export default function BudgetScreen() {
  const { budgets, totalExpenses, loadData, addBudget } = useFinanceStore();
  const { format } = useCurrency();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<TransactionCategory>("food");
  const [selectedColor, setSelectedColor] = useState(BUDGET_COLORS[0]);
  const [limitInput, setLimitInput] = useState("");
  const [adding, setAdding] = useState(false);

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overBudgetCount = budgets.filter((b) => b.spent > b.limit).length;
  const pct = Math.min((totalSpent / totalBudget) * 100, 100);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1200);
  };

  const resetModal = () => {
    setSelectedCategory("food");
    setSelectedColor(BUDGET_COLORS[0]);
    setLimitInput("");
    setAdding(false);
    setShowAddModal(false);
  };

  const handleAddBudget = () => {
    const limit = parseFloat(limitInput);
    if (!limitInput.trim() || isNaN(limit) || limit <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid budget limit.");
      return;
    }
    const alreadyExists = budgets.some((b) => b.category === selectedCategory);
    if (alreadyExists) {
      Alert.alert(
        "Already Exists",
        `A budget for "${selectedCategory}" already exists. Please choose another category.`,
      );
      return;
    }
    const cat = BUDGET_CATEGORIES.find((c) => c.key === selectedCategory);
    setAdding(true);
    setTimeout(() => {
      addBudget({
        category: selectedCategory,
        limit,
        color: selectedColor,
        icon: cat?.icon ?? "circle",
      });
      resetModal();
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
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
        <Text style={styles.screenTitle}>Budget</Text>
        <Text style={styles.subtitle}>Track your monthly spending limits</Text>

        {/* Summary Hero */}
        <LinearGradient
          colors={["#1E1E3F", "#2D1B69"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Total Budget</Text>
              <Text style={styles.heroAmount}>{format(totalBudget, 0)}</Text>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroLabel}>Spent</Text>
              <Text
                style={[
                  styles.heroAmount,
                  { color: pct >= 90 ? COLORS.danger : COLORS.warning },
                ]}
              >
                {format(totalSpent, 0)}
              </Text>
            </View>
          </View>

          {/* Big Progress */}
          <View style={styles.heroProgress}>
            <View style={styles.heroProgressTrack}>
              <LinearGradient
                colors={
                  pct >= 90
                    ? [COLORS.danger, "#DC2626"]
                    : pct >= 70
                      ? [COLORS.warning, "#D97706"]
                      : [COLORS.primary, COLORS.secondary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.heroProgressFill, { width: `${pct}%` }]}
              />
            </View>
            <Text style={styles.heroPercent}>{pct.toFixed(0)}% used</Text>
          </View>

          {/* Stats */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Feather name="check-circle" size={14} color={COLORS.success} />
              <Text style={styles.heroStatText}>
                {budgets.length - overBudgetCount} on track
              </Text>
            </View>
            {overBudgetCount > 0 && (
              <View style={styles.heroStat}>
                <Feather name="alert-circle" size={14} color={COLORS.danger} />
                <Text style={[styles.heroStatText, { color: COLORS.danger }]}>
                  {overBudgetCount} over budget
                </Text>
              </View>
            )}
            <View style={styles.heroStat}>
              <Feather name="dollar-sign" size={14} color={COLORS.textMuted} />
              <Text style={styles.heroStatText}>
                {format(totalBudget - totalSpent, 0)} left
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Budget Cards */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Category Budgets</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Feather name="plus" size={16} color={COLORS.primary} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {budgets.map((budget) => (
          <BudgetCard key={budget.id} budget={budget} />
        ))}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Feather name="zap" size={18} color={COLORS.warning} />
            <Text style={styles.tipsTitle}>Smart Tips</Text>
          </View>
          {overBudgetCount > 0 && (
            <View style={styles.tip}>
              <Feather
                name="alert-triangle"
                size={14}
                color={COLORS.danger}
                style={styles.tipIcon}
              />
              <Text style={styles.tipText}>
                You have {overBudgetCount} category budget
                {overBudgetCount > 1 ? "s" : ""} exceeded this month. Try
                reducing discretionary spending.
              </Text>
            </View>
          )}
          <View style={styles.tip}>
            <Feather
              name="trending-up"
              size={14}
              color={COLORS.success}
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Aim to keep your spending at 80% or less of your budget for each
              category.
            </Text>
          </View>
          <View style={styles.tip}>
            <Feather
              name="target"
              size={14}
              color={COLORS.primary}
              style={styles.tipIcon}
            />
            <Text style={styles.tipText}>
              Set a savings goal to allocate the remaining $
              {(totalBudget - totalSpent).toFixed(0)} wisely.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Add Budget Modal ── */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={resetModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={resetModal}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Budget</Text>
            <Text style={styles.modalSubtitle}>
              Set a monthly spending limit for a category
            </Text>

            {/* Category Picker */}
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {BUDGET_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.catChip,
                    selectedCategory === c.key && {
                      borderColor: selectedColor,
                      backgroundColor: `${selectedColor}20`,
                    },
                  ]}
                  onPress={() => setSelectedCategory(c.key)}
                >
                  <Feather
                    name={c.icon as any}
                    size={16}
                    color={
                      selectedCategory === c.key
                        ? selectedColor
                        : COLORS.textMuted
                    }
                  />
                  <Text
                    style={[
                      styles.catChipText,
                      selectedCategory === c.key && { color: selectedColor },
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Color Picker */}
            <Text style={styles.fieldLabel}>Color</Text>
            <View style={styles.colorRow}>
              {BUDGET_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    selectedColor === c && styles.colorDotSelected,
                  ]}
                  onPress={() => setSelectedColor(c)}
                >
                  {selectedColor === c && (
                    <Feather name="check" size={14} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Limit Input */}
            <Text style={styles.fieldLabel}>Monthly Limit (₹)</Text>
            <View style={styles.limitInputWrap}>
              <Feather
                name="dollar-sign"
                size={18}
                color={COLORS.textMuted}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={styles.limitInput}
                placeholder="Enter amount"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                value={limitInput}
                onChangeText={(v) => setLimitInput(v.replace(/[^0-9.]/g, ""))}
              />
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: selectedColor }]}
                onPress={handleAddBudget}
                disabled={adding}
              >
                <Text style={styles.saveBtnText}>
                  {adding ? "Adding…" : "Add Budget"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.dark },
  content: { padding: 20 },
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  heroLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  heroAmount: {
    color: COLORS.textPrimary,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  heroRight: {
    alignItems: "flex-end",
  },
  heroProgress: {
    marginBottom: 16,
  },
  heroProgressTrack: {
    height: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: 12,
  },
  heroPercent: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  heroStats: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },
  heroStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  heroStatText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
  },
  addBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  tipsCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: `${COLORS.warning}30`,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  tipsTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  tipIcon: {
    marginTop: 1,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalSheet: {
    backgroundColor: "#12122A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "#1E2040",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 20,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryRow: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 20,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#1E2040",
    backgroundColor: "#0F0F2A",
  },
  catChipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: "#FFF",
  },
  limitInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F0F2A",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#1E2040",
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 24,
  },
  limitInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#334155",
    alignItems: "center",
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
