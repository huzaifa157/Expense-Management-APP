import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { getExpenses } from "../services/expenseService";
import { getBudgets } from "../services/budgetService";
import CategoryIcon from "../components/CategoryIcon";

export default function HomeScreen() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const navigation = useNavigation();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallBudget, setOverallBudget] = useState(null);

  const loadExpenses = useCallback(async () => {
    try {
      const response = await getExpenses({ limit: 500, sort: "date_desc" });

      if (response.success) {
        setExpenses(response.data);
      }

      const budgetResponse = await getBudgets();
      if (budgetResponse.success) {
        setOverallBudget(budgetResponse.data.find((b) => b.category === "Overall") || null);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const totalIncome = expenses
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = expenses
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        data={expenses.slice(0, 5)}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadExpenses} />
        }
        ListHeaderComponent={
          <View className="px-6 pt-4 pb-2">
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text className="text-gray-400 dark:text-gray-500 text-sm">Welcome back,</Text>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.name || "there"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate("Settings")}
                activeOpacity={0.8}
                className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center"
              >
                <Text className="text-white text-lg font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              className={`rounded-3xl p-6 mb-4 shadow-sm ${
                balance < 0 ? "bg-red-600" : "bg-blue-600"
              }`}
            >
              <Text className="text-blue-100 text-sm font-medium">Current Balance</Text>
              <Text className="text-white text-4xl font-extrabold mt-1 tracking-tight">
                {balance < 0 ? "-" : ""}
                {formatCurrency(Math.abs(balance))}
              </Text>

              <View
                className="flex-row justify-between mt-6 pt-5"
                style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.2)" }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Ionicons name="arrow-down" size={14} color="#fff" />
                  </View>
                  <View>
                    <Text className="text-blue-100 text-xs">Income</Text>
                    <Text className="text-white text-base font-semibold">
                      {formatCurrency(totalIncome)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    <Ionicons name="arrow-up" size={14} color="#fff" />
                  </View>
                  <View>
                    <Text className="text-blue-100 text-xs">Expense</Text>
                    <Text className="text-white text-base font-semibold">
                      {formatCurrency(totalExpense)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {!!overallBudget && (
              <TouchableOpacity
                onPress={() => navigation.navigate("Budgets")}
                activeOpacity={0.8}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <View className="flex-row justify-between mb-2">
                  <Text className="font-semibold text-gray-900 dark:text-white">
                    Monthly Budget
                  </Text>
                  <Text className="text-gray-400 dark:text-gray-500 text-xs font-medium">
                    {overallBudget.percent}%
                  </Text>
                </View>

                <View className="h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <View
                    style={{
                      width: `${Math.min(overallBudget.percent, 100)}%`,
                      backgroundColor:
                        overallBudget.percent >= 100
                          ? "#ef4444"
                          : overallBudget.percent >= 80
                          ? "#f59e0b"
                          : "#2563eb",
                    }}
                    className="h-2 rounded-full"
                  />
                </View>

                <Text className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                  {formatCurrency(overallBudget.spent)} of {formatCurrency(overallBudget.monthlyLimit)}
                </Text>
              </TouchableOpacity>
            )}

            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Recent Transactions
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("History")}>
                <Text className="text-blue-600 text-sm font-semibold">See all</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("EditTransaction", { expense: item })}
            activeOpacity={0.7}
            className="flex-row items-center bg-white dark:bg-gray-800 mx-6 mb-3 p-3.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <CategoryIcon category={item.category} />

            <View className="flex-1 px-3">
              <Text className="font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                {item.category}
              </Text>
            </View>

            <Text
              className={`font-bold text-base ${
                item.type === "income" ? "text-green-600" : "text-red-500"
              }`}
            >
              {item.type === "income" ? "+" : "-"}
              {formatCurrency(item.amount)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading && (
            <View className="items-center mt-8">
              <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
                <Ionicons name="receipt-outline" size={28} color="#9ca3af" />
              </View>
              <Text className="text-center text-gray-400 dark:text-gray-500">
                No transactions yet
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
