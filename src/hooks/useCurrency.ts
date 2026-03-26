import { useFinanceStore } from "../store/financeStore";
import { formatCurrency } from "../utils/helpers";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "CA$",
  AUD: "A$",
  INR: "₹",
  SGD: "S$",
};

export const useCurrency = () => {
  const currency = useFinanceStore((state) => state.profile.currency);
  const symbol = CURRENCY_SYMBOLS[currency] || "₹";
  return {
    format: (amount: number, decimals = 0) =>
      formatCurrency(amount, currency, decimals),
    symbol,
    currency,
  };
};
