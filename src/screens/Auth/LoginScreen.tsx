import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useFinanceStore } from "../../store/financeStore";
import { RootStackParamList } from "../../types";

const { width, height } = Dimensions.get("window");

type NavProp = StackNavigationProp<RootStackParamList>;

// Floating bubble component
function Bubble({
  size,
  left,
  top,
  delay,
  opacity,
}: {
  size: number;
  left: string;
  top: string;
  delay: number;
  opacity: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: -30,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: left as any,
          top: top as any,
          opacity,
          transform: [{ translateY: anim }],
        },
      ]}
    />
  );
}

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const { login, loadData } = useFinanceStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(60)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer on logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Staggered entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(email, password);
      loadData();
      // AppNavigator switches screens automatically when isLoggedIn changes
    }, 1000);
  };

  const handleGuestLogin = () => {
    setLoading(true);
    setTimeout(() => {
      login("guest@moneyflow.app", "guest");
      loadData();
      // AppNavigator switches screens automatically when isLoggedIn changes
    }, 600);
  };

  const logoGlow = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Gradient Background */}
      <LinearGradient
        colors={["#0D0D1E", "#1A0A2E", "#0F0F1A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Bubbles */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Bubble size={180} left="70%" top="2%" delay={0} opacity={0.08} />
        <Bubble size={120} left="-8%" top="15%" delay={500} opacity={0.06} />
        <Bubble size={80} left="80%" top="40%" delay={1000} opacity={0.05} />
        <Bubble size={200} left="30%" top="65%" delay={300} opacity={0.06} />
        <Bubble size={60} left="10%" top="55%" delay={800} opacity={0.07} />
      </View>

      {/* Accent glow orbs */}
      <View style={[styles.orb, styles.orb1]} pointerEvents="none" />
      <View style={[styles.orb, styles.orb2]} pointerEvents="none" />

      <View style={styles.container}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <Animated.View style={[styles.logoRing, { opacity: logoGlow }]}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Text style={styles.logoEmoji}>₹</Text>
            </LinearGradient>
          </Animated.View>

          <Text style={styles.appName}>MoneyFlow AI</Text>
          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            Smart Finance, Smarter Life
          </Animated.Text>
        </Animated.View>

        {/* Form Card */}
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: formOpacity,
              transform: [{ translateY: formSlide }],
            },
          ]}
        >
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subText}>Sign in to continue</Text>

          {/* Email Input */}
          <View
            style={[
              styles.inputWrap,
              focusedField === "email" && styles.inputWrapFocused,
            ]}
          >
            <Feather
              name="mail"
              size={18}
              color={focusedField === "email" ? "#6366F1" : "#64748B"}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password Input */}
          <View
            style={[
              styles.inputWrap,
              focusedField === "password" && styles.inputWrapFocused,
            ]}
          >
            <Feather
              name="lock"
              size={18}
              color={focusedField === "password" ? "#6366F1" : "#64748B"}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Sign In</Text>
                  <Feather
                    name="arrow-right"
                    size={18}
                    color="#FFF"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Guest / Demo Access */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={handleGuestLogin}
            activeOpacity={0.8}
          >
            <Feather name="user" size={16} color="#8B5CF6" />
            <Text style={styles.guestBtnText}>Continue as Guest</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: formOpacity }]}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerLink}>Create Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  // Background orbs
  orb: {
    position: "absolute",
    borderRadius: 999,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: "#6366F120",
    top: -80,
    right: -80,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: "#8B5CF615",
    bottom: 80,
    left: -80,
  },

  // Bubbles
  bubble: {
    position: "absolute",
    backgroundColor: "#6366F1",
  },

  // Logo section
  logoSection: {
    alignItems: "center",
    marginBottom: 36,
  },
  logoRing: {
    width: 90,
    height: 90,
    borderRadius: 28,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 16,
  },
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  logoEmoji: {
    fontSize: 40,
    color: "#FFFFFF",
    fontWeight: "900",
  },
  appName: {
    fontSize: 30,
    fontWeight: "900",
    color: "#F1F5F9",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "#8B5CF6",
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // Form Card
  formCard: {
    backgroundColor: "rgba(26, 26, 46, 0.9)",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F1F5F9",
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
    fontWeight: "500",
  },

  // Inputs
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 15, 26, 0.8)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#2D2D44",
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapFocused: {
    borderColor: "#6366F1",
    backgroundColor: "rgba(99, 102, 241, 0.06)",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#F1F5F9",
    fontSize: 15,
    fontWeight: "500",
  },
  eyeBtn: {
    padding: 4,
  },

  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 22,
    marginTop: -4,
  },
  forgotText: {
    color: "#6366F1",
    fontSize: 13,
    fontWeight: "600",
  },

  // Login button
  loginBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  loginBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2D2D44",
  },
  dividerText: {
    color: "#64748B",
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
  },

  // Guest button
  guestBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#8B5CF640",
    backgroundColor: "#8B5CF610",
    gap: 8,
  },
  guestBtnText: {
    color: "#8B5CF6",
    fontSize: 15,
    fontWeight: "700",
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
  },
  footerLink: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "700",
  },
});
