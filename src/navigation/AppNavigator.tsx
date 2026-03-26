import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Feather } from "@expo/vector-icons";

import { MainTabParamList, RootStackParamList } from "../types";
import { COLORS } from "../data/mockData";
import { useFinanceStore } from "../store/financeStore";

// Screens
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import TransactionsScreen from "../screens/Transactions/TransactionsScreen";
import AnalyticsScreen from "../screens/Analytics/AnalyticsScreen";
import BudgetScreen from "../screens/Budget/BudgetScreen";
import GoalsScreen from "../screens/Goals/GoalsScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import AddTransactionScreen from "../screens/Transactions/AddTransactionScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, keyof typeof Feather.glyphMap> = {
            Dashboard: "home",
            Transactions: "repeat",
            Analytics: "bar-chart-2",
            Budget: "credit-card",
            Goals: "target",
            Profile: "user",
          };
          const iconName = icons[route.name] || "circle";
          return (
            <View
              style={[
                styles.iconContainer,
                focused && styles.iconContainerActive,
              ]}
            >
              <Feather name={iconName} size={focused ? 22 : 20} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isLoggedIn = useFinanceStore((state) => state.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{
                presentation: "modal",
                cardStyleInterpolator: ({ current, layouts }) => ({
                  cardStyle: {
                    transform: [
                      {
                        translateY: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.height, 0],
                        }),
                      },
                    ],
                  },
                }),
              }}
            />
            <Stack.Screen
              name="EditTransaction"
              component={AddTransactionScreen}
              options={{
                presentation: "modal",
                cardStyleInterpolator: ({ current, layouts }) => ({
                  cardStyle: {
                    transform: [
                      {
                        translateY: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.height, 0],
                        }),
                      },
                    ],
                  },
                }),
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.darkCard,
    borderTopColor: COLORS.darkBorder,
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 85 : 65,
    paddingBottom: Platform.OS === "ios" ? 25 : 8,
    paddingTop: 8,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  iconContainer: {
    width: 40,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  iconContainerActive: {
    backgroundColor: `${COLORS.primary}25`,
  },
});
