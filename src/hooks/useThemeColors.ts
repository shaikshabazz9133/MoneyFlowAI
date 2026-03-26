import { useFinanceStore } from "../store/financeStore";
import { COLORS, LIGHT_COLORS } from "../data/mockData";

export const useThemeColors = () => {
  const theme = useFinanceStore((state) => state.profile.theme);
  return theme === "dark" ? COLORS : LIGHT_COLORS;
};
