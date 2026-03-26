import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../../data/mockData";

interface ToastProps {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info";
  onHide: () => void;
}

export default function Toast({ visible, message, type, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide());
  };

  const config = {
    success: { color: COLORS.success, icon: "check-circle" as const },
    error: { color: COLORS.danger, icon: "x-circle" as const },
    info: { color: COLORS.info, icon: "info" as const },
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }], opacity }]}
    >
      <View style={[styles.toast, { borderLeftColor: config[type].color }]}>
        <Feather
          name={config[type].icon}
          size={20}
          color={config[type].color}
        />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={hide}>
          <Feather name="x" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  message: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 12,
  },
});
