import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { getExpenses } from "../services/expenseService";

export default function HomeScreen() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const navigation = useNavigation();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = useCallback(async () => {
    try {
      const response = await getExpenses({ limit: 500, sort: "date_desc" });

      if (response.success) {
        setExpenses(response.data);
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
            <Text className="text-gray-500 dark:text-gray-400 text-base">Welcome back,</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {user?.name || "there"} 👋
            </Text>

            <View className="bg-blue-600 rounded-2xl p-6 mb-4">
              <Text className="text-blue-100 text-sm">Current Balance</Text>
              <Text className="text-white text-4xl font-bold mt-1">
                {formatCurrency(balance)}
              </Text>

              <View className="flex-row justify-between mt-6">
                <View>
                  <Text className="text-blue-100 text-xs">Income</Text>
                  <Text className="text-white text-lg font-semibold">
                    +{formatCurrency(totalIncome)}
                  </Text>
                </View>

                <View>
                  <Text className="text-blue-100 text-xs">Expense</Text>
                  <Text className="text-white text-lg font-semibold">
                    -{formatCurrency(totalExpense)}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Recent Transactions
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("EditTransaction", { expense: item })}
            className="flex-row justify-between items-center bg-white dark:bg-gray-800 mx-6 mb-3 p-4 rounded-xl"
          >
            <View className="flex-1 pr-3">
              <Text className="font-semibold text-gray-900 dark:text-white">
                {item.title}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-xs">{item.category}</Text>
              {!!item.notes && (
                <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1" numberOfLines={1}>
                  {item.notes}
                </Text>
              )}
            </View>

            <Text
              className={`font-bold ${
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
            <Text className="text-center text-gray-400 dark:text-gray-500 mt-4">
              No transactions yet
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
