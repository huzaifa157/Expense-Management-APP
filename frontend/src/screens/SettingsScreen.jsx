import { useState } from "react";
import { Alert, Modal, ScrollView, Share, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { CURRENCIES, useCurrency } from "../context/CurrencyContext";
import { getExpenses, importExpenses } from "../services/expenseService";
import CustomButton from "../components/CustomButton";

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
  const navigation = useNavigation();

  const [restoreVisible, setRestoreVisible] = useState(false);
  const [restoreText, setRestoreText] = useState("");
  const [restoring, setRestoring] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const handleBackup = async () => {
    try {
      const response = await getExpenses({ limit: 500, sort: "date_desc" });

      if (!response.success || response.data.length === 0) {
        Alert.alert("Nothing to back up", "You don't have any transactions yet.");
        return;
      }

      await Share.share({
        title: "Expense backup",
        message: JSON.stringify(response.data, null, 2),
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not create backup.");
    }
  };

  const handleRestore = async () => {
    let parsed;
    try {
      parsed = JSON.parse(restoreText);
    } catch (error) {
      Alert.alert("Invalid JSON", "Paste the exact JSON from a backup export.");
      return;
    }

    const expenses = Array.isArray(parsed) ? parsed : [parsed];

    setRestoring(true);
    try {
      const response = await importExpenses(expenses);
      if (response.success) {
        Alert.alert("Restore complete", response.message);
        setRestoreText("");
        setRestoreVisible(false);
      } else {
        Alert.alert("Error", response.message || "Could not restore backup.");
      }
    } finally {
      setRestoring(false);
    }
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
      <ScrollView className="px-6 pt-4" contentContainerStyle={{ paddingBottom: 32 }}>
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
          onPress={() => navigation.navigate("Budgets")}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl mb-3 flex-row items-center justify-between"
        >
          <Text className="font-bold text-lg text-gray-900 dark:text-white">Budgets</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Recurring")}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl mb-4 flex-row items-center justify-between"
        >
          <Text className="font-bold text-lg text-gray-900 dark:text-white">
            Recurring Transactions
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleExport}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl mb-4"
        >
          <Text className="text-center font-bold text-lg text-gray-900 dark:text-white">
            Export Transactions (CSV)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBackup}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl mb-3"
        >
          <Text className="text-center font-bold text-lg text-gray-900 dark:text-white">
            Backup (JSON)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRestoreVisible(true)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl mb-4"
        >
          <Text className="text-center font-bold text-lg text-gray-900 dark:text-white">
            Restore from Backup
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
      </ScrollView>

      <Modal visible={restoreVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-800 rounded-t-2xl p-6">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Restore from Backup
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-xs mb-3">
              Paste the JSON text from a previous "Backup (JSON)" export below.
            </Text>

            <TextInput
              value={restoreText}
              onChangeText={setRestoreText}
              multiline
              placeholder="[ { ... }, { ... } ]"
              placeholderTextColor="#9ca3af"
              className="border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white h-40 mb-4"
              textAlignVertical="top"
            />

            <View className="flex-row">
              <View className="flex-1 mr-2">
                <CustomButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setRestoreVisible(false);
                    setRestoreText("");
                  }}
                />
              </View>
              <View className="flex-1 ml-2">
                <CustomButton title="Restore" onPress={handleRestore} disabled={restoring} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
