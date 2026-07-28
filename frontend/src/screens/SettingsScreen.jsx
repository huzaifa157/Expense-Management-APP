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

function SettingsRow({ icon, iconBg, iconColor, label, onPress, withBorder }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between p-4 ${
        withBorder ? "border-b border-gray-100 dark:border-gray-700" : ""
      }`}
    >
      <View className="flex-row items-center flex-1">
        <View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${iconBg}`}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text className="font-semibold text-gray-900 dark:text-white">{label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );
}

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

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-6 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center mr-4">
            <Text className="text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
              {user?.name}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm" numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        <Text className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase mb-2 ml-1">
          Preferences
        </Text>
        <View className="bg-white dark:bg-gray-800 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center flex-1">
              <View className="w-9 h-9 rounded-full bg-indigo-50 items-center justify-center mr-3">
                <Ionicons name="moon" size={16} color="#6366f1" />
              </View>
              <View>
                <Text className="font-semibold text-gray-900 dark:text-white">Dark Mode</Text>
                <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                  Switch between light and dark theme
                </Text>
              </View>
            </View>

            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>

          <View className="p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-9 h-9 rounded-full bg-emerald-50 items-center justify-center mr-3">
                <Ionicons name="cash" size={16} color="#059669" />
              </View>
              <Text className="font-semibold text-gray-900 dark:text-white">Currency</Text>
            </View>

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
        </View>

        <Text className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase mb-2 ml-1">
          Planning
        </Text>
        <View className="bg-white dark:bg-gray-800 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <SettingsRow
            icon="pie-chart"
            iconBg="bg-blue-50"
            iconColor="#2563eb"
            label="Budgets"
            onPress={() => navigation.navigate("Budgets")}
            withBorder
          />
          <SettingsRow
            icon="repeat"
            iconBg="bg-purple-50"
            iconColor="#8b5cf6"
            label="Recurring Transactions"
            onPress={() => navigation.navigate("Recurring")}
          />
        </View>

        <Text className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase mb-2 ml-1">
          Data
        </Text>
        <View className="bg-white dark:bg-gray-800 rounded-2xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <SettingsRow
            icon="download-outline"
            iconBg="bg-amber-50"
            iconColor="#f59e0b"
            label="Export Transactions (CSV)"
            onPress={handleExport}
            withBorder
          />
          <SettingsRow
            icon="cloud-upload-outline"
            iconBg="bg-cyan-50"
            iconColor="#0891b2"
            label="Backup (JSON)"
            onPress={handleBackup}
            withBorder
          />
          <SettingsRow
            icon="cloud-download-outline"
            iconBg="bg-teal-50"
            iconColor="#0d9488"
            label="Restore from Backup"
            onPress={() => setRestoreVisible(true)}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          className="bg-red-500 p-4 rounded-2xl shadow-sm"
        >
          <Text className="text-white text-center font-bold text-base tracking-wide">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={restoreVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
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
