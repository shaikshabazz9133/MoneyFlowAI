import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useCurrency } from "../../hooks/useCurrency";

interface SummaryCardProps {
  title: string;
  amount: number;
  change?: number;
  gradient: [string, string];
  icon: keyof typeof Feather.glyphMap;
}

function AnimatedNumber({ value }: { value: number }) {
  const { format } = useCurrency();
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    animValue.addListener(({ value: v }) => setDisplayValue(v));
    Animated.timing(animValue, {
      toValue: value,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    return () => animValue.removeAllListeners();
  }, [value]);

  return <Text style={styles.amount}>{format(displayValue, 2)}</Text>;
}

export default function SummaryCard({
  title,
  amount,
  change,
  gradient,
  icon,
}: SummaryCardProps) {
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const isPositive = change !== undefined && change >= 0;

  return (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={1}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.glassOverlay} />
          <View style={styles.header}>
            <View style={styles.iconBg}>
              <Feather name={icon} size={20} color="#FFF" />
            </View>
            {change !== undefined && (
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor: isPositive
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.2)",
                  },
                ]}
              >
                <Feather
                  name={isPositive ? "trending-up" : "trending-down"}
                  size={12}
                  color="#FFF"
                />
                <Text style={styles.changeText}>
                  {Math.abs(change).toFixed(1)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.title}>{title}</Text>
          <AnimatedNumber value={amount} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    minWidth: 160,
    marginRight: 12,
    overflow: "hidden",
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 3,
  },
  changeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  amount: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
});
