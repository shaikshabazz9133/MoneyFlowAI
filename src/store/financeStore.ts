import { create } from "zustand";
import {
  Transaction,
  Budget,
  Goal,
  UserProfile,
  TransactionType,
  TransactionCategory,
} from "../types";
import {
  transactionsData,
  budgetData,
  goalsData,
  userProfile as defaultProfile,
} from "../data/mockData";

interface FinanceStore {
  // Auth
  isLoggedIn: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;

  // Data
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  profile: UserProfile;
  isLoading: boolean;

  // Computed
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;

  // Filters
  filterType: TransactionType | "all";
  filterCategory: TransactionCategory | "all";

  // Actions
  loadData: () => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, "id" | "spent">) => void;
  updateBudget: (id: string, spent: number) => void;
  deleteBudget: (id: string) => void;
  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, amount: number) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setFilterType: (type: TransactionType | "all") => void;
  setFilterCategory: (category: TransactionCategory | "all") => void;
  getFilteredTransactions: () => Transaction[];
}

const computeTotals = (transactions: Transaction[]) => {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return {
    totalIncome,
    totalExpenses,
    totalBalance: totalIncome - totalExpenses,
  };
};

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  isLoggedIn: false,
  login: (_email: string, _password: string) => {
    // Simulate login – in production validate credentials
    set({ isLoggedIn: true });
  },
  logout: () => {
    set({ isLoggedIn: false });
  },

  transactions: [],
  budgets: [],
  goals: [],
  profile: defaultProfile,
  isLoading: false,
  totalBalance: 0,
  totalIncome: 0,
  totalExpenses: 0,
  filterType: "all",
  filterCategory: "all",

  loadData: () => {
    set({ isLoading: true });
    // Simulate API call
    setTimeout(() => {
      const { totalIncome, totalExpenses, totalBalance } =
        computeTotals(transactionsData);
      set({
        transactions: transactionsData,
        budgets: budgetData,
        goals: goalsData,
        totalIncome,
        totalExpenses,
        totalBalance,
        isLoading: false,
      });
    }, 1000);
  },

  addTransaction: (transaction) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    set((state) => {
      const transactions = [newTransaction, ...state.transactions];
      const { totalIncome, totalExpenses, totalBalance } =
        computeTotals(transactions);
      return { transactions, totalIncome, totalExpenses, totalBalance };
    });
  },

  updateTransaction: (id, updatedFields) => {
    set((state) => {
      const transactions = state.transactions.map((t) =>
        t.id === id ? { ...t, ...updatedFields } : t,
      );
      const { totalIncome, totalExpenses, totalBalance } =
        computeTotals(transactions);
      return { transactions, totalIncome, totalExpenses, totalBalance };
    });
  },

  deleteTransaction: (id) => {
    set((state) => {
      const transactions = state.transactions.filter((t) => t.id !== id);
      const { totalIncome, totalExpenses, totalBalance } =
        computeTotals(transactions);
      return { transactions, totalIncome, totalExpenses, totalBalance };
    });
  },

  updateBudget: (id, spent) => {
    set((state) => ({
      budgets: state.budgets.map((b) => (b.id === id ? { ...b, spent } : b)),
    }));
  },

  addBudget: (budget) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      spent: 0,
    };
    set((state) => ({ budgets: [...state.budgets, newBudget] }));
  },

  deleteBudget: (id) => {
    set((state) => ({
      budgets: state.budgets.filter((b) => b.id !== id),
    }));
  },

  addGoal: (goal) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
    };
    set((state) => ({ goals: [...state.goals, newGoal] }));
  },

  updateGoal: (id, amount) => {
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id
          ? {
              ...g,
              currentAmount: Math.min(g.currentAmount + amount, g.targetAmount),
            }
          : g,
      ),
    }));
  },

  updateProfile: (profileUpdate) => {
    set((state) => ({ profile: { ...state.profile, ...profileUpdate } }));
  },

  setFilterType: (type) => set({ filterType: type }),
  setFilterCategory: (category) => set({ filterCategory: category }),

  getFilteredTransactions: () => {
    const { transactions, filterType, filterCategory } = get();
    return transactions.filter((t) => {
      const typeMatch = filterType === "all" || t.type === filterType;
      const categoryMatch =
        filterCategory === "all" || t.category === filterCategory;
      return typeMatch && categoryMatch;
    });
  },
}));
