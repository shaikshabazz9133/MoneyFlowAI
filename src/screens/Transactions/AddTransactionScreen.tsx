import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useFinanceStore } from "../../store/financeStore";
import {
  Transaction,
  TransactionCategory,
  TransactionType,
  RootStackParamList,
} from "../../types";
import { COLORS, CATEGORY_COLORS, CATEGORY_ICONS } from "../../data/mockData";
import InputField from "../../components/ui/InputField";
import CustomButton from "../../components/ui/CustomButton";

type RouteProps = RouteProp<RootStackParamList, "AddTransaction">;

const CATEGORIES: TransactionCategory[] = [
  "salary",
  "freelance",
  "investment",
  "food",
  "transport",
  "shopping",
  "entertainment",
  "health",
  "bills",
  "education",
  "travel",
  "other",
];

export default function AddTransactionScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { addTransaction, updateTransaction } = useFinanceStore();

  const editingTransaction = (route.params as any)?.transaction as
    | Transaction
    | undefined;
  const isEditing = !!editingTransaction;

  const [type, setType] = useState<TransactionType>(
    editingTransaction?.type || "expense",
  );
  const [title, setTitle] = useState(editingTransaction?.title || "");
  const [amount, setAmount] = useState(
    editingTransaction ? String(editingTransaction.amount) : "",
  );
  const [category, setCategory] = useState<TransactionCategory>(
    editingTransaction?.category || "food",
  );
  const [note, setNote] = useState(editingTransaction?.note || "");
  const [date, setDate] = useState(
    editingTransaction?.date || new Date().toISOString().split("T")[0],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      newErrors.amount = "Enter a valid amount";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const transactionData = {
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        category,
        date,
        note: note.trim(),
        icon: CATEGORY_ICONS[category],
      };

      if (isEditing && editingTransaction) {
        updateTransaction(editingTransaction.id, transactionData);
      } else {
        addTransaction(transactionData);
      }
      setLoading(false);
      navigation.goBack();
    }, 500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Transaction" : "New Transaction"}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Type Toggle */}
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === "expense" && styles.typeBtnExpenseActive,
              ]}
              onPress={() => setType("expense")}
            >
              <LinearGradient
                colors={
                  type === "expense"
                    ? [COLORS.danger, "#DC2626"]
                    : ["transparent", "transparent"]
                }
                style={styles.typeGradient}
              >
                <Feather
                  name="arrow-up-circle"
                  size={18}
                  color={type === "expense" ? "#FFF" : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.typeText,
                    type === "expense" && styles.typeTextActive,
                  ]}
                >
                  Expense
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                type === "income" && styles.typeBtnIncomeActive,
              ]}
              onPress={() => setType("income")}
            >
              <LinearGradient
                colors={
                  type === "income"
                    ? [COLORS.success, "#059669"]
                    : ["transparent", "transparent"]
                }
                style={styles.typeGradient}
              >
                <Feather
                  name="arrow-down-circle"
                  size={18}
                  color={type === "income" ? "#FFF" : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.typeText,
                    type === "income" && styles.typeTextActive,
                  ]}
                >
                  Income
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Amount Display */}
          <View style={styles.amountCard}>
            <Text style={styles.amountCurrency}>$</Text>
            <Text
              style={[
                styles.amountDisplay,
                {
                  color: type === "income" ? COLORS.success : COLORS.danger,
                },
              ]}
            >
              {amount || "0.00"}
            </Text>
          </View>

          {/* Form */}
          <InputField
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Monthly Salary"
            leftIcon="tag"
            error={errors.title}
          />

          <InputField
            label="Amount"
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            keyboardType="decimal-pad"
            leftIcon="dollar-sign"
            error={errors.amount}
          />

          <InputField
            label="Date"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            leftIcon="calendar"
          />

          <InputField
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Add a note..."
            leftIcon="file-text"
            multiline
          />

          {/* Category Picker */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const iconName =
                (CATEGORY_ICONS[cat] as keyof typeof Feather.glyphMap) ||
                "circle";
              const catColor = CATEGORY_COLORS[cat] || COLORS.textMuted;
              const isSelected = category === cat;

              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryItem,
                    isSelected && {
                      borderColor: catColor,
                      backgroundColor: `${catColor}15`,
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor: `${catColor}${isSelected ? "30" : "15"}`,
                      },
                    ]}
                  >
                    <Feather name={iconName} size={16} color={catColor} />
                  </View>
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && { color: catColor },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Save Button */}
          <CustomButton
            title={isEditing ? "Update Transaction" : "Add Transaction"}
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
          />

          {isEditing && (
            <CustomButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelBtn}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  backBtn: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.darkCard,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  toggleWrapper: {
    flexDirection: "row",
    backgroundColor: COLORS.darkCard,
    borderRadius: 18,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  typeBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  typeBtnExpenseActive: {},
  typeBtnIncomeActive: {},
  typeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
    borderRadius: 14,
  },
  typeText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  typeTextActive: {
    color: "#FFF",
  },
  amountCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.darkCard,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    gap: 6,
  },
  amountCurrency: {
    color: COLORS.textMuted,
    fontSize: 28,
    fontWeight: "700",
  },
  amountDisplay: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  categoryItem: {
    width: "30%",
    backgroundColor: COLORS.darkCard,
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.darkBorder,
    gap: 6,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  saveBtn: {
    marginBottom: 12,
  },
  cancelBtn: {},
});
