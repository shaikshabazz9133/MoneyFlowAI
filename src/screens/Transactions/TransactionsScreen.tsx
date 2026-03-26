import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Feather } from "@expo/vector-icons";

import { useFinanceStore } from "../../store/financeStore";
import {
  Transaction,
  TransactionCategory,
  TransactionType,
  RootStackParamList,
} from "../../types";
import { COLORS } from "../../data/mockData";
import TransactionItem from "../../components/cards/TransactionItem";
import FloatingActionButton from "../../components/ui/FloatingActionButton";
import { SkeletonTransactionItem } from "../../components/ui/SkeletonLoader";

type NavProp = StackNavigationProp<RootStackParamList>;

const CATEGORIES: (TransactionCategory | "all")[] = [
  "all",
  "food",
  "transport",
  "shopping",
  "entertainment",
  "health",
  "bills",
  "education",
  "travel",
];
const TYPES: (TransactionType | "all")[] = ["all", "income", "expense"];

export default function TransactionsScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    transactions,
    isLoading,
    loadData,
    deleteTransaction,
    filterType,
    filterCategory,
    setFilterType,
    setFilterCategory,
    getFilteredTransactions,
  } = useFinanceStore();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState<
    TransactionType | "all"
  >("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<
    TransactionCategory | "all"
  >("all");

  const filteredTransactions = getFilteredTransactions().filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleTypeFilter = (type: TransactionType | "all") => {
    setActiveTypeFilter(type);
    setFilterType(type);
  };

  const handleCategoryFilter = (cat: TransactionCategory | "all") => {
    setActiveCategoryFilter(cat);
    setFilterCategory(cat);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={(t) =>
        navigation.navigate("EditTransaction", { transaction: t })
      }
      onDelete={deleteTransaction}
      showDelete
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Feather name="list" size={52} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No transactions found</Text>
      <Text style={styles.emptySubtitle}>
        Try changing your filters or add a new transaction
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Transactions</Text>
        <View style={styles.headerRight}>
          <Text style={styles.countBadge}>{filteredTransactions.length}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Feather
          name="search"
          size={18}
          color={COLORS.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filter */}
      <View style={styles.filterRow}>
        {TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterChip,
              activeTypeFilter === type && styles.filterChipActive,
              type === "income" &&
                activeTypeFilter === type &&
                styles.filterChipIncome,
              type === "expense" &&
                activeTypeFilter === type &&
                styles.filterChipExpense,
            ]}
            onPress={() => handleTypeFilter(type)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeTypeFilter === type && styles.filterChipTextActive,
                type === "income" &&
                  activeTypeFilter === type && { color: COLORS.success },
                type === "expense" &&
                  activeTypeFilter === type && { color: COLORS.danger },
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Filter */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategoryFilter === item && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryFilter(item)}
          >
            <Text
              style={[
                styles.categoryChipText,
                activeCategoryFilter === item && styles.categoryChipTextActive,
              ]}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Transactions List */}
      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonTransactionItem key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}

      <View style={{ height: 80 }} />
      <FloatingActionButton
        onPress={() => navigation.navigate("AddTransaction", {})}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerRight: {
    backgroundColor: `${COLORS.primary}30`,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  countBadge: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkCard,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.darkCard,
    borderWidth: 1.5,
    borderColor: COLORS.darkBorder,
  },
  filterChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
  },
  filterChipIncome: {
    borderColor: COLORS.success,
    backgroundColor: `${COLORS.success}15`,
  },
  filterChipExpense: {
    borderColor: COLORS.danger,
    backgroundColor: `${COLORS.danger}15`,
  },
  filterChipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: COLORS.primary,
  },
  categoryScroll: {
    marginBottom: 14,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.darkCard,
    borderWidth: 1.5,
    borderColor: COLORS.darkBorder,
  },
  categoryChipActive: {
    backgroundColor: `${COLORS.secondary}25`,
    borderColor: COLORS.secondary,
  },
  categoryChipText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },
  categoryChipTextActive: {
    color: COLORS.secondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
});
