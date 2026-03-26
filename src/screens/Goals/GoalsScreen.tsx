import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { useFinanceStore } from "../../store/financeStore";
import { Goal } from "../../types";
import { COLORS } from "../../data/mockData";
import { useCurrency } from "../../hooks/useCurrency";
import GoalCard from "../../components/cards/GoalCard";
import CustomButton from "../../components/ui/CustomButton";
import InputField from "../../components/ui/InputField";

const GOAL_COLORS = [
  COLORS.primary,
  "#8B5CF6",
  "#F97316",
  "#10B981",
  "#3B82F6",
  "#EC4899",
  "#F59E0B",
  "#14B8A6",
];

const GOAL_ICONS = [
  "shield",
  "laptop",
  "map-pin",
  "trending-up",
  "home",
  "car",
  "heart",
  "star",
];

export default function GoalsScreen() {
  const { goals, addGoal, updateGoal } = useFinanceStore();
  const { format } = useCurrency();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [contributeAmount, setContributeAmount] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS.primary);
  const [selectedIcon, setSelectedIcon] = useState("shield");
  const [loading, setLoading] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const completedGoals = goals.filter(
    (g) => g.currentAmount >= g.targetAmount,
  ).length;

  const handleAddGoal = () => {
    if (!title.trim() || !target || !deadline) return;
    setLoading(true);
    setTimeout(() => {
      addGoal({
        title: title.trim(),
        targetAmount: parseFloat(target),
        currentAmount: 0,
        deadline,
        color: selectedColor,
        icon: selectedIcon,
      });
      setTitle("");
      setTarget("");
      setDeadline("");
      setSelectedColor(COLORS.primary);
      setSelectedIcon("shield");
      setLoading(false);
      setShowAddModal(false);
    }, 500);
  };

  const handleContribute = () => {
    if (!selectedGoal || !contributeAmount) return;
    const amount = parseFloat(contributeAmount);
    if (isNaN(amount) || amount <= 0) return;
    updateGoal(selectedGoal.id, amount);
    setContributeAmount("");
    setShowContributeModal(false);
    setSelectedGoal(null);
  };

  const handleGoalPress = (goal: Goal) => {
    if (goal.currentAmount >= goal.targetAmount) {
      Alert.alert(
        "🎉 Goal Complete!",
        `You've reached your "${goal.title}" goal!`,
      );
      return;
    }
    setSelectedGoal(goal);
    setShowContributeModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Goals</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAddModal(true)}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.addBtnGradient}
            >
              <Feather name="plus" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Overall Progress */}
        <LinearGradient colors={["#1A1A3E", "#2D1B69"]} style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>Total Saved</Text>
              <Text style={styles.heroAmount}>{format(totalSaved, 0)}</Text>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroLabel}>Total Target</Text>
              <Text
                style={[styles.heroAmount, { color: COLORS.textSecondary }]}
              >
                {format(totalTarget, 0)}
              </Text>
            </View>
          </View>

          <View style={styles.heroProgressWrapper}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary, "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.heroProgressFill, { width: `${overallPct}%` }]}
            />
          </View>
          <Text style={styles.heroPercent}>
            {overallPct.toFixed(1)}% overall progress
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Feather name="target" size={14} color={COLORS.primary} />
              <Text style={styles.heroStatText}>{goals.length} goals set</Text>
            </View>
            <View style={styles.heroStat}>
              <Feather name="check-circle" size={14} color={COLORS.success} />
              <Text style={styles.heroStatText}>
                {completedGoals} completed
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Goals List */}
        <Text style={styles.sectionTitle}>Your Goals</Text>

        {goals.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="target" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptyText}>
              Tap the + button to create your first savings goal
            </Text>
            <CustomButton
              title="Create Goal"
              onPress={() => setShowAddModal(true)}
              style={{ marginTop: 16, width: 200 }}
            />
          </View>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onContribute={handleGoalPress}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Goal</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Feather name="x" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <InputField
                label="Goal Name"
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Emergency Fund"
                leftIcon="target"
              />
              <InputField
                label="Target Amount ($)"
                value={target}
                onChangeText={(v) => setTarget(v.replace(/[^0-9.]/g, ""))}
                placeholder="10000"
                keyboardType="decimal-pad"
                leftIcon="dollar-sign"
              />
              <InputField
                label="Deadline (YYYY-MM-DD)"
                value={deadline}
                onChangeText={setDeadline}
                placeholder="2026-12-31"
                leftIcon="calendar"
              />

              {/* Color Picker */}
              <Text style={styles.pickerLabel}>Color</Text>
              <View style={styles.colorGrid}>
                {GOAL_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorSwatchSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <Feather name="check" size={14} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Icon Picker */}
              <Text style={styles.pickerLabel}>Icon</Text>
              <View style={styles.iconGrid}>
                {GOAL_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && {
                        backgroundColor: `${selectedColor}30`,
                        borderColor: selectedColor,
                      },
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Feather
                      name={icon as keyof typeof Feather.glyphMap}
                      size={20}
                      color={
                        selectedIcon === icon ? selectedColor : COLORS.textMuted
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <CustomButton
                title="Create Goal"
                onPress={handleAddGoal}
                loading={loading}
                style={{ marginTop: 8 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        visible={showContributeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowContributeModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.contributeSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              Add to "{selectedGoal?.title}"
            </Text>
            <Text style={styles.modalSubtitle}>
              {format(selectedGoal?.currentAmount ?? 0, 0)} of{" "}
              {format(selectedGoal?.targetAmount ?? 0, 0)} saved
            </Text>
            <InputField
              label="Contribution Amount ($)"
              value={contributeAmount}
              onChangeText={(v) =>
                setContributeAmount(v.replace(/[^0-9.]/g, ""))
              }
              placeholder="500"
              keyboardType="decimal-pad"
              leftIcon="dollar-sign"
            />
            <View style={styles.contributeActions}>
              <CustomButton
                title="Cancel"
                onPress={() => {
                  setShowContributeModal(false);
                  setContributeAmount("");
                }}
                variant="outline"
                style={{ flex: 1 }}
              />
              <CustomButton
                title="Add Funds"
                onPress={handleContribute}
                style={{ flex: 1 }}
              />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  addBtn: { borderRadius: 14, overflow: "hidden" },
  addBtnGradient: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  heroLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  heroAmount: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "900",
  },
  heroRight: { alignItems: "flex-end" },
  heroProgressWrapper: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: 10,
  },
  heroPercent: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 14,
  },
  heroStats: { flexDirection: "row", gap: 20 },
  heroStat: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroStatText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  emptyState: { alignItems: "center", paddingTop: 50, gap: 10 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 20, fontWeight: "800" },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 250,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.darkCard,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  contributeSheet: {
    backgroundColor: COLORS.darkCard,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.darkBorder,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 20,
  },
  pickerLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  colorGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  colorSwatchSelected: {
    borderWidth: 2.5,
    borderColor: "#FFF",
  },
  iconGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.darkSurface,
    borderWidth: 1.5,
    borderColor: COLORS.darkBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  contributeActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
});
