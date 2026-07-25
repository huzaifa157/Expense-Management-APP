import { Alert, Share, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { CURRENCIES, useCurrency } from "../context/CurrencyContext";
import { getExpenses } from "../services/expenseService";

const toCsvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const buildCsv = (expenses) => {
  const header = ["Date", "Title", "Type", "Category", "Amount", "Notes"];
  const rows = expenses.map((item) => [
    new Date(item.date).toISOString().split("T")[0],
    item.title,
    item.type,
    item.category,
    item.amount,
    item.notes || "",
  ]);

  return [header, ...rows].map((row) => row.map(toCsvValue).join(",")).join("\n");
};

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currency, changeCurrency } = useCurrency();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const handleExport = async () => {
    try {
      const response = await getExpenses({ limit: 500, sort: "date_desc" });

      if (!response.success || response.data.length === 0) {
        Alert.alert("Nothing to export", "You don't have any transactions yet.");
        return;
      }

      const csv = buildCsv(response.data);
      await Share.share({
        title: "Expense export",
        message: csv,
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not export your transactions.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-6 pt-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</Text>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6">
          <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center mb-4">
            <Text className="text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>

          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {user?.name}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500">{user?.email}</Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-semibold text-gray-900 dark:text-white">Dark Mode</Text>
              <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Switch between light and dark theme
              </Text>
            </View>

            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-6">
          <Text className="font-semibold text-gray-900 dark:text-white mb-3">Currency</Text>

          <View className="flex-row flex-wrap">
            {CURRENCIES.map((option) => (
              <TouchableOpacity
                key={option.code}
                onPress={() => changeCurrency(option.code)}
                className={`px-4 py-2 rounded-full border mr-2 mb-2 ${
                  currency.code === option.code
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <Text
                  className={
                    currency.code === option.code
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }
                >
                  {option.symbol} {option.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleExport}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl mb-4"
        >
          <Text className="text-center font-bold text-lg text-gray-900 dark:text-white">
            Export Transactions (CSV)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-500 p-4 rounded-xl"
        >
          <Text className="text-white text-center font-bold text-lg">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
