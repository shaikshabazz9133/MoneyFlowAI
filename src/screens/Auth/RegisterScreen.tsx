import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useFinanceStore } from "../../store/financeStore";
import { RootStackParamList } from "../../types";

type NavProp = StackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavProp>();
  const { login, loadData, updateProfile } = useFinanceStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animations
  const formSlide = useRef(new Animated.Value(60)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formSlide, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const validate = () => {
    if (!name.trim()) {
      Alert.alert("Missing Field", "Please enter your full name.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long.",
      );
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleRegister = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      // Register = create account + log in immediately
      login(email, password);
      updateProfile({ name: name.trim(), email: email.trim() });
      loadData();
      // AppNavigator handles the screen switch when isLoggedIn becomes true
    }, 1200);
  };

  const inputStyle = (field: string) => [
    styles.inputWrap,
    focusedField === field && styles.inputWrapFocused,
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <LinearGradient
        colors={["#0D0D1E", "#1A0A2E", "#0F0F1A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Accent orbs */}
      <View style={[styles.orb, styles.orb1]} pointerEvents="none" />
      <View style={[styles.orb, styles.orb2]} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={22} color="#CBD5E1" />
        </TouchableOpacity>

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoSection,
            { transform: [{ scale: logoScale }], opacity: logoOpacity },
          ]}
        >
          <LinearGradient
            colors={["#6366F1", "#8B5CF6", "#A855F7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoEmoji}>₹</Text>
          </LinearGradient>
          <Text style={styles.appName}>MoneyFlow AI</Text>
          <Text style={styles.tagline}>Create your free account</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: formOpacity,
              transform: [{ translateY: formSlide }],
            },
          ]}
        >
          <Text style={styles.welcomeText}>Get Started</Text>
          <Text style={styles.subText}>Fill in your details below</Text>

          {/* Name */}
          <View style={inputStyle("name")}>
            <Feather
              name="user"
              size={18}
              color={focusedField === "name" ? "#6366F1" : "#64748B"}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Email */}
          <View style={inputStyle("email")}>
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

          {/* Password */}
          <View style={inputStyle("password")}>
            <Feather
              name="lock"
              size={18}
              color={focusedField === "password" ? "#6366F1" : "#64748B"}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password (min 6 chars)"
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

          {/* Confirm Password */}
          <View style={inputStyle("confirm")}>
            <Feather
              name="lock"
              size={18}
              color={focusedField === "confirm" ? "#6366F1" : "#64748B"}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#475569"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              onFocus={() => setFocusedField("confirm")}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(!showConfirm)}
              style={styles.eyeBtn}
            >
              <Feather
                name={showConfirm ? "eye-off" : "eye"}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6", "#A855F7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.registerBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.registerBtnText}>Create Account</Text>
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

          {/* Terms note */}
          <Text style={styles.termsText}>
            By creating an account you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
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
  backBtn: {
    marginTop: 56,
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoGradient: {
    width: 76,
    height: 76,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  logoEmoji: {
    fontSize: 34,
    color: "#FFFFFF",
    fontWeight: "900",
  },
  appName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#F1F5F9",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: "#8B5CF6",
    fontWeight: "600",
    marginTop: 4,
  },
  formCard: {
    backgroundColor: "#12122A",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E2040",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F1F5F9",
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 20,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F0F2A",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#1E2040",
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
  },
  inputWrapFocused: {
    borderColor: "#6366F1",
    backgroundColor: "#1A1A38",
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
  registerBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  registerBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  termsText: {
    color: "#475569",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: "#8B5CF6",
    fontWeight: "600",
  },
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
