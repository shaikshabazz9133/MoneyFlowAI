import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useFinanceStore } from "../../store/financeStore";
import { useThemeColors } from "../../hooks/useThemeColors";
import { useCurrency } from "../../hooks/useCurrency";
import { RootStackParamList } from "../../types";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "SGD"];

type NavProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavProp>();
  const COLORS = useThemeColors();
  const { format } = useCurrency();
  const {
    profile,
    updateProfile,
    transactions,
    totalIncome,
    totalExpenses,
    logout,
  } = useFinanceStore();

  const [darkMode, setDarkMode] = useState(profile.theme === "dark");
  const [notifications, setNotifications] = useState(true);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // Edit Profile Modal state
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);

  const totalBalance = totalIncome - totalExpenses;
  const transactionCount = transactions.length;

  const handleThemeToggle = (value: boolean) => {
    setDarkMode(value);
    updateProfile({ theme: value ? "dark" : "light" });
  };

  const handleCurrencySelect = (currency: string) => {
    updateProfile({ currency });
    setShowCurrencyPicker(false);
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }
    const initials = editName
      .trim()
      .split(" ")
      .map((w) => w[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
    updateProfile({
      name: editName.trim(),
      email: editEmail.trim(),
      avatar: initials,
    });
    setEditVisible(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logout();
          navigation.replace("Login");
        },
      },
    ]);
  };

  function SettingRow({
    icon,
    label,
    value,
    onPress,
    rightElement,
    iconColor = COLORS.primary,
    danger = false,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    iconColor?: string;
    danger?: boolean;
  }) {
    return (
      <TouchableOpacity
        style={styles.settingRow}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View
          style={[styles.settingIcon, { backgroundColor: `${iconColor}20` }]}
        >
          <Feather
            name={icon}
            size={18}
            color={danger ? "#EF4444" : iconColor}
          />
        </View>
        <Text
          style={[
            styles.settingLabel,
            { color: danger ? "#EF4444" : COLORS.textPrimary },
          ]}
        >
          {label}
        </Text>
        <View style={styles.settingRight}>
          {value && (
            <Text style={[styles.settingValue, { color: COLORS.textMuted }]}>
              {value}
            </Text>
          )}
          {rightElement}
          {onPress && !rightElement && (
            <Feather name="chevron-right" size={16} color={COLORS.textMuted} />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: COLORS.dark }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={COLORS.dark === "#0F0F1A" ? "light-content" : "dark-content"}
      />

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: COLORS.darkCard,
                borderColor: COLORS.darkBorder,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS.textPrimary }]}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Feather name="x" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.inputLabel, { color: COLORS.textSecondary }]}>
              Full Name
            </Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: COLORS.darkSurface,
                  borderColor: COLORS.darkBorder,
                },
              ]}
            >
              <Feather
                name="user"
                size={16}
                color={COLORS.textMuted}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={[styles.textInput, { color: COLORS.textPrimary }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <Text style={[styles.inputLabel, { color: COLORS.textSecondary }]}>
              Email Address
            </Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: COLORS.darkSurface,
                  borderColor: COLORS.darkBorder,
                },
              ]}
            >
              <Feather
                name="mail"
                size={16}
                color={COLORS.textMuted}
                style={{ marginRight: 8 }}
              />
              <TextInput
                style={[styles.textInput, { color: COLORS.textPrimary }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  { borderColor: COLORS.darkBorder },
                ]}
                onPress={() => setEditVisible(false)}
              >
                <Text
                  style={[
                    styles.modalCancelText,
                    { color: COLORS.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveProfile}
                activeOpacity={0.85}
                style={{ flex: 1 }}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalSaveBtn}
                >
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.screenTitle, { color: COLORS.textPrimary }]}>
          Profile
        </Text>

        {/* Profile Hero */}
        <LinearGradient
          colors={["#6366F1", "#8B5CF6", "#A855F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.glassCircle} />
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.avatar}</Text>
            </View>
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={() => setEditVisible(true)}
            >
              <Feather name="edit-2" size={13} color="#6366F1" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{transactionCount}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{format(totalIncome)}</Text>
              <Text style={styles.statLabel}>Income</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#6EE7B7" }]}>
                {format(totalBalance)}
              </Text>
              <Text style={styles.statLabel}>Balance</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.textMuted }]}>
            Account
          </Text>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: COLORS.darkCard,
                borderColor: COLORS.darkBorder,
              },
            ]}
          >
            <SettingRow
              icon="user"
              label="Edit Profile"
              iconColor="#6366F1"
              onPress={() => {
                setEditName(profile.name);
                setEditEmail(profile.email);
                setEditVisible(true);
              }}
            />
            <View
              style={[styles.divider, { backgroundColor: COLORS.darkBorder }]}
            />
            <SettingRow
              icon="lock"
              label="Change Password"
              iconColor="#3B82F6"
              onPress={() => {}}
            />
            <View
              style={[styles.divider, { backgroundColor: COLORS.darkBorder }]}
            />
            <SettingRow
              icon="shield"
              label="Security & Privacy"
              iconColor="#10B981"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.textMuted }]}>
            Preferences
          </Text>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: COLORS.darkCard,
                borderColor: COLORS.darkBorder,
              },
            ]}
          >
            <SettingRow
              icon="moon"
              label="Dark Mode"
              iconColor="#8B5CF6"
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={handleThemeToggle}
                  trackColor={{ false: COLORS.darkBorder, true: "#6366F1" }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <View
              style={[styles.divider, { backgroundColor: COLORS.darkBorder }]}
            />
            <SettingRow
              icon="bell"
              label="Notifications"
              iconColor="#F59E0B"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: COLORS.darkBorder, true: "#6366F1" }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <View
              style={[styles.divider, { backgroundColor: COLORS.darkBorder }]}
            />
            <SettingRow
              icon="dollar-sign"
              label="Currency"
              value={profile.currency}
              iconColor="#10B981"
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            />
            {showCurrencyPicker && (
              <View style={styles.currencyPicker}>
                {CURRENCIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.currencyOption,
                      {
                        backgroundColor: COLORS.darkSurface,
                        borderColor: COLORS.darkBorder,
                      },
                      profile.currency === c && {
                        borderColor: "#6366F1",
                        backgroundColor: "#6366F115",
                      },
                    ]}
                    onPress={() => handleCurrencySelect(c)}
                  >
                    <Text
                      style={[
                        styles.currencyText,
                        { color: COLORS.textMuted },
                        profile.currency === c && { color: "#6366F1" },
                      ]}
                    >
                      {c}
                    </Text>
                    {profile.currency === c && (
                      <Feather name="check" size={13} color="#6366F1" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.textMuted }]}>
            Data
          </Text>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: COLORS.darkCard,
                borderColor: COLORS.darkBorder,
              },
            ]}
          >
            <SettingRow
              icon="download"
              label="Export Data"
              iconColor="#3B82F6"
              onPress={() =>
                Alert.alert(
                  "Export",
                  "Your financial data will be exported as CSV.",
                )
              }
            />
            <View
              style={[styles.divider, { backgroundColor: COLORS.darkBorder }]}
            />
            <SettingRow
              icon="upload-cloud"
              label="Backup to Cloud"
              iconColor="#6366F1"
              onPress={() => {}}
            />
            <View
              style={[styles.divider, { backgroundColor: COLORS.darkBorder }]}
            />
            <SettingRow
              icon="trash-2"
              label="Clear All Data"
              iconColor="#EF4444"
              danger
              onPress={() =>
                Alert.alert(
                  "Clear Data",
                  "This will permanently delete all your transaction data.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Clear", style: "destructive", onPress: () => {} },
                  ],
                )
              }
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.textMuted }]}>
            About
          </Text>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: COLORS.darkCard,
                borderColor: COLORS.darkBorder,
              },
            ]}
          >
            <SettingRow
              icon="info"
              label="App Version"
              value="v1.0.0"
              iconColor={COLORS.textMuted}
            />
            <View
              style={[styles.divider, { backgroundColor: COLORS.darkBorder }]}
            />
            <SettingRow
              icon="file-text"
              label="Privacy Policy"
              iconColor={COLORS.textMuted}
              onPress={() => {}}
            />
            <View
              style={[styles.divider, { backgroundColor: COLORS.darkBorder }]}
            />
            <SettingRow
              icon="help-circle"
              label="Support"
              iconColor={COLORS.textMuted}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Branding */}
        <View style={styles.brandingFooter}>
          <LinearGradient
            colors={["#6366F1", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.brandingBadge}
          >
            <Text style={styles.brandingText}>MoneyFlow AI</Text>
          </LinearGradient>
          <Text style={[styles.brandingSubtitle, { color: COLORS.textMuted }]}>
            Smart Finance Tracking
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 20 },
  screenTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  profileCard: {
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    overflow: "hidden",
    position: "relative",
  },
  glassCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -60,
    right: -40,
  },
  avatarWrapper: { position: "relative", marginBottom: 14 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 4,
  },
  profileEmail: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 16,
    width: "100%",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 3,
  },
  statLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  settingCard: { borderRadius: 20, overflow: "hidden", borderWidth: 1 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingValue: { fontSize: 14, fontWeight: "600" },
  divider: { height: 1, marginLeft: 68 },
  currencyPicker: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  currencyOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  currencyText: { fontSize: 13, fontWeight: "700" },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#EF444415",
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EF444430",
  },
  signOutText: { color: "#EF4444", fontSize: 16, fontWeight: "700" },
  brandingFooter: { alignItems: "center", gap: 8 },
  brandingBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  brandingText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  brandingSubtitle: { fontSize: 13, fontWeight: "500" },

  // Edit Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  textInput: { flex: 1, fontSize: 15, fontWeight: "500" },
  modalBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 15, fontWeight: "700" },
  modalSaveBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalSaveText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
});
