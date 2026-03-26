import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { COLORS } from "../../data/mockData";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export default function SkeletonLoader({
  width = "100%",
  height = 80,
  borderRadius = 16,
  style,
}: SkeletonLoaderProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonLoader
        height={24}
        width="60%"
        borderRadius={8}
        style={{ marginBottom: 12 }}
      />
      <SkeletonLoader
        height={36}
        width="80%"
        borderRadius={8}
        style={{ marginBottom: 8 }}
      />
      <SkeletonLoader height={16} width="40%" borderRadius={6} />
    </View>
  );
}

export function SkeletonTransactionItem() {
  return (
    <View style={styles.transactionItem}>
      <SkeletonLoader width={48} height={48} borderRadius={14} />
      <View style={styles.transactionMiddle}>
        <SkeletonLoader
          height={16}
          width="60%"
          borderRadius={6}
          style={{ marginBottom: 8 }}
        />
        <SkeletonLoader height={12} width="40%" borderRadius={6} />
      </View>
      <SkeletonLoader height={20} width={70} borderRadius={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.darkBorder,
  },
  card: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    marginBottom: 8,
  },
  transactionMiddle: {
    flex: 1,
    marginLeft: 14,
  },
});
