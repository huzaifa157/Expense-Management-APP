import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { EXPENSE_CATEGORIES } from "../constants/categories";
import { useCurrency } from "../context/CurrencyContext";
import { getBudgets, saveBudget, deleteBudget } from "../services/budgetService";

const ALL_BUDGET_CATEGORIES = ["Overall", ...EXPENSE_CATEGORIES];

export default function BudgetsScreen() {
  const navigation = useNavigation();
  const { formatCurrency } = useCurrency();

  const [budgets, setBudgets] = useState([]);
  const [drafts, setDrafts] = useState({});

  const load = useCallback(async () => {
    const response = await getBudgets();
    if (response.success) {
      setBudgets(response.data);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const budgetFor = (category) => budgets.find((b) => b.category === category);

  const handleSave = async (category) => {
    const value = Number(drafts[category]);
    if (!value || value <= 0) {
      Alert.alert("Invalid amount", "Enter a monthly limit greater than 0.");
      return;
    }

    const response = await saveBudget(category, value);
    if (response.success) {
      setDrafts((prev) => ({ ...prev, [category]: undefined }));
      load();
    } else {
      Alert.alert("Error", response.message || "Could not save budget.");
    }
  };

  const handleDelete = (budget) => {
    Alert.alert("Remove budget", `Remove the ${budget.category} budget?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteBudget(budget._id);
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-6 pt-4 pb-2 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</Text>
      </View>

      <ScrollView className="px-6 pt-2" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="text-gray-400 dark:text-gray-500 text-sm mb-4">
          Set a monthly limit per category (or an overall limit) and get alerted at 80% and 100%
          usage.
        </Text>

        {ALL_BUDGET_CATEGORIES.map((category) => {
          const existing = budgetFor(category);
          const percent = existing ? Math.min(existing.percent, 100) : 0;
          const barColor =
            existing?.percent >= 100 ? "#ef4444" : existing?.percent >= 80 ? "#f59e0b" : "#2563eb";

          return (
            <View
              key={category}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-semibold text-gray-900 dark:text-white">{category}</Text>

                {!!existing && (
                  <TouchableOpacity onPress={() => handleDelete(existing)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              {existing ? (
                <>
                  <View className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 mb-2 overflow-hidden">
                    <View
                      style={{ width: `${percent}%`, backgroundColor: barColor }}
                      className="h-2 rounded-full"
                    />
                  </View>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs">
                    {formatCurrency(existing.spent)} of {formatCurrency(existing.monthlyLimit)} (
                    {existing.percent}%)
                  </Text>
                </>
              ) : (
                <Text className="text-gray-400 dark:text-gray-500 text-xs mb-1">
                  No budget set yet
                </Text>
              )}

              <View className="flex-row items-center mt-3">
                <TextInput
                  value={
                    drafts[category] !== undefined
                      ? drafts[category]
                      : existing
                      ? String(existing.monthlyLimit)
                      : ""
                  }
                  onChangeText={(text) =>
                    setDrafts((prev) => ({ ...prev, [category]: text.replace(/[^0-9.]/g, "") }))
                  }
                  placeholder="Monthly limit"
                  placeholderTextColor="#9ca3af"
                  keyboardType="decimal-pad"
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mr-2 text-gray-900 dark:text-white"
                />

                <TouchableOpacity
                  onPress={() => handleSave(category)}
                  className="bg-blue-600 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
