import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getExpenses } from "../services/expenseService";
import { useCurrency } from "../context/CurrencyContext";
import PieChart from "../components/PieChart";

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const startOfNextMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 1);

const monthLabel = (date) =>
  date.toLocaleDateString(undefined, { month: "long", year: "numeric" });

export default function StatisticsScreen() {
  const { formatCurrency } = useCurrency();

  const [monthOffset, setMonthOffset] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const viewedMonth = new Date();
  viewedMonth.setMonth(viewedMonth.getMonth() + monthOffset);
  const rangeStart = startOfMonth(viewedMonth);
  const rangeEnd = startOfNextMonth(viewedMonth);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getExpenses({
        limit: 500,
        startDate: rangeStart.toISOString(),
        endDate: new Date(rangeEnd.getTime() - 1).toISOString(),
      });

      if (response.success) {
        setExpenses(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthOffset]);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const buildBreakdown = (items) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);

    const totalsByCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    return Object.entries(totalsByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const expenseItems = expenses.filter((item) => item.type === "expense");
  const incomeItems = expenses.filter((item) => item.type === "income");

  const totalExpense = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);

  const expenseBreakdown = buildBreakdown(expenseItems);
  const incomeBreakdown = buildBreakdown(incomeItems);

  const renderBreakdown = (title, breakdown, barColor, emptyLabel, showChart) => (
    <>
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3 mt-2">
        {title}
      </Text>

      {showChart && <PieChart data={breakdown} />}

      {breakdown.length === 0 && !loading && (
        <Text className="text-center text-gray-400 dark:text-gray-500 mb-4">
          {emptyLabel}
        </Text>
      )}

      {breakdown.map((item) => (
        <View
          key={item.category}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <View className="flex-row justify-between mb-2">
            <Text className="font-semibold text-gray-900 dark:text-white">
              {item.category}
            </Text>
            <Text className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(item.amount)}
            </Text>
          </View>

          <View className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <View
              className={`h-2 rounded-full ${barColor}`}
              style={{ width: `${item.percent}%` }}
            />
          </View>
        </View>
      ))}
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="px-6 pt-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Statistics
        </Text>

        <View className="flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-2 py-2 mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <TouchableOpacity onPress={() => setMonthOffset((prev) => prev - 1)} className="p-2">
            <Ionicons name="chevron-back" size={20} color="#2563eb" />
          </TouchableOpacity>

          <Text className="font-semibold text-gray-900 dark:text-white">
            {monthLabel(viewedMonth)}
          </Text>

          <TouchableOpacity
            onPress={() => setMonthOffset((prev) => Math.min(prev + 1, 0))}
            disabled={monthOffset === 0}
            className="p-2"
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={monthOffset === 0 ? "#d1d5db" : "#2563eb"}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row mb-6">
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 mr-2 shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center mb-1">
              <Ionicons name="arrow-down-circle" size={14} color="#16a34a" />
              <Text className="text-gray-400 dark:text-gray-500 text-xs ml-1">Total Income</Text>
            </View>
            <Text className="text-green-600 text-xl font-bold">
              {formatCurrency(totalIncome)}
            </Text>
          </View>

          <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 ml-2 shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center mb-1">
              <Ionicons name="arrow-up-circle" size={14} color="#ef4444" />
              <Text className="text-gray-400 dark:text-gray-500 text-xs ml-1">Total Expense</Text>
            </View>
            <Text className="text-red-500 text-xl font-bold">
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

        {renderBreakdown(
          "Spending by Category",
          expenseBreakdown,
          "bg-blue-600",
          "No expenses recorded this month",
          true
        )}

        {renderBreakdown(
          "Income by Category",
          incomeBreakdown,
          "bg-green-600",
          "No income recorded this month"
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
