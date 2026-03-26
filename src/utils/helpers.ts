import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const formatCurrency = (
  amount: number,
  currency: string = "USD",
  minimumFractionDigits: number = 2,
): string => {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CAD: "CA$",
    AUD: "A$",
    INR: "₹",
    SGD: "S$",
  };
  const symbol = symbols[currency] || "$";
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const getDaysUntil = (dateStr: string): number => {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

export const getProgressPercentage = (
  current: number,
  target: number,
): number => {
  if (target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
};

export const groupTransactionsByDate = <T extends { date: string }>(
  items: T[],
): Record<string, T[]> => {
  return items.reduce(
    (groups, item) => {
      const date = item.date.split("T")[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
      return groups;
    },
    {} as Record<string, T[]>,
  );
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};
