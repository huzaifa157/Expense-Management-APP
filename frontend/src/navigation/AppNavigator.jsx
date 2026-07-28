import { useEffect } from "react";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { registerForPushNotificationsAsync } from "../utils/notifications";

import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import EditTransactionScreen from "../screens/EditTransactionScreen";
import BudgetsScreen from "../screens/BudgetsScreen";
import RecurringScreen from "../screens/RecurringScreen";

import BottomTabs from "./BottomTab";

const Stack = createNativeStackNavigator();

function SplashLoader() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

export default function AppNavigator() {
  const { isLoggedIn, isLoading } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    if (isLoggedIn) {
      registerForPushNotificationsAsync();
    }
  }, [isLoggedIn]);

  if (isLoading) {
    return <SplashLoader />;
  }

  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Main" component={BottomTabs} />
            <Stack.Screen name="EditTransaction" component={EditTransactionScreen} />
            <Stack.Screen name="Budgets" component={BudgetsScreen} />
            <Stack.Screen name="Recurring" component={RecurringScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
