export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investment"
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "health"
  | "bills"
  | "education"
  | "travel"
  | "other";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  note?: string;
  icon: string;
}

export interface Budget {
  id: string;
  category: TransactionCategory;
  limit: number;
  spent: number;
  color: string;
  icon: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  icon: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryData {
  category: TransactionCategory;
  amount: number;
  color: string;
  percentage: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  currency: string;
  theme: "light" | "dark";
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  AddTransaction: { transaction?: Transaction };
  EditTransaction: { transaction: Transaction };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Analytics: undefined;
  Budget: undefined;
  Goals: undefined;
  Profile: undefined;
};
