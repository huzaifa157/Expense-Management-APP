import { useCallback, useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { deleteExpense, getExpenses } from "../services/expenseService";
import { useCurrency } from "../context/CurrencyContext";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../constants/categories";

const ALL_CATEGORIES = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];

const TYPE_FILTERS = [
  { key: "", label: "All" },
  { key: "expense", label: "Expense" },
  { key: "income", label: "Income" },
];

const RANGE_FILTERS = [
  { key: "all", label: "All Time" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
];

const SORT_OPTIONS = [
  { key: "date_desc", label: "Newest", icon: "arrow-down" },
  { key: "date_asc", label: "Oldest", icon: "arrow-up" },
  { key: "amount_desc", label: "Highest", icon: "trending-down" },
  { key: "amount_asc", label: "Lowest", icon: "trending-up" },
];

const rangeToStartDate = (range) => {
  const now = new Date();

  if (range === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }

  if (range === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  if (range === "year") {
    return new Date(now.getFullYear(), 0, 1).toISOString();
  }

  return undefined;
};

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { formatCurrency } = useCurrency();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [range, setRange] = useState("all");
  const [sort, setSort] = useState("date_desc");

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getExpenses({
        limit: 500,
        sort,
        type: type || undefined,
        category: category || undefined,
        search: search.trim() || undefined,
        startDate: rangeToStartDate(range),
      });

      if (response.success) {
        setExpenses(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [sort, type, category, search, range]);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadExpenses();
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type, category, range, sort]);

  const handleDelete = (item) => {
    Alert.alert(
      "Delete Transaction",
      `Delete "${item.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(item._id);
              setExpenses((prev) => prev.filter((e) => e._id !== item._id));
            } catch (error) {
              console.log(error);
              Alert.alert("Error", "Could not delete transaction.");
            }
          },
        },
      ]
    );
  };

  const cycleSort = () => {
    const currentIndex = SORT_OPTIONS.findIndex((option) => option.key === sort);
    const next = SORT_OPTIONS[(currentIndex + 1) % SORT_OPTIONS.length];
    setSort(next.key);
  };

  const activeSort = SORT_OPTIONS.find((option) => option.key === sort);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">History</Text>

          <TouchableOpacity
            onPress={cycleSort}
            className="flex-row items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700"
          >
            <Ionicons name={activeSort.icon} size={14} color="#2563eb" />
            <Text className="text-blue-600 text-xs font-semibold ml-1">
              {activeSort.label}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">
          Tap to edit · Long press to delete
        </Text>

        <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl px-3 mt-3 border border-gray-200 dark:border-gray-700">
          <Ionicons name="search" size={16} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search title or notes"
            placeholderTextColor="#9ca3af"
            className="flex-1 px-2 py-3 text-gray-900 dark:text-white"
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {TYPE_FILTERS.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => {
                setType(option.key);
                setCategory("");
              }}
              className={`px-4 py-2 rounded-full border mr-2 ${
                type === option.key
                  ? "bg-blue-600 border-blue-600"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <Text
                className={
                  type === option.key ? "text-white" : "text-gray-600 dark:text-gray-300"
                }
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {RANGE_FILTERS.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => setRange(option.key)}
              className={`px-4 py-2 rounded-full border mr-2 ${
                range === option.key
                  ? "bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <Text
                className={
                  range === option.key
                    ? "text-white dark:text-gray-900"
                    : "text-gray-600 dark:text-gray-300"
                }
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
          contentContainerStyle={{ paddingRight: 24 }}
        >
          <TouchableOpacity
            onPress={() => setCategory("")}
            className={`px-4 py-2 rounded-full border mr-2 ${
              category === "" ? "bg-blue-100 border-blue-300" : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <Text
              className={
                category === "" ? "text-blue-700" : "text-gray-600 dark:text-gray-300"
              }
            >
              All Categories
            </Text>
          </TouchableOpacity>

          {ALL_CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setCategory(item)}
              className={`px-4 py-2 rounded-full border mr-2 ${
                category === item
                  ? "bg-blue-100 border-blue-300"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <Text
                className={
                  category === item ? "text-blue-700" : "text-gray-600 dark:text-gray-300"
                }
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadExpenses} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("EditTransaction", { expense: item })}
            onLongPress={() => handleDelete(item)}
            className="flex-row justify-between items-center bg-white dark:bg-gray-800 mb-3 p-4 rounded-xl"
          >
            <View className="flex-1 pr-3">
              <Text className="font-semibold text-gray-900 dark:text-white">{item.title}</Text>
              <Text className="text-gray-400 dark:text-gray-500 text-xs">
                {item.category} · {new Date(item.date).toLocaleDateString()}
              </Text>
              {!!item.notes && (
                <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1" numberOfLines={2}>
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
              No transactions match your filters
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
