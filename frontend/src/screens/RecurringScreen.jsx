import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import { CATEGORY_ICONS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../constants/categories";
import { useCurrency } from "../context/CurrencyContext";
import {
  getRecurring,
  createRecurring,
  toggleRecurring,
  deleteRecurring,
} from "../services/recurringService";

const FREQUENCIES = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

export default function RecurringScreen() {
  const navigation = useNavigation();
  const { formatCurrency } = useCurrency();

  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [type, setType] = useState("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [submitting, setSubmitting] = useState(false);

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const load = useCallback(async () => {
    const response = await getRecurring();
    if (response.success) setItems(response.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const resetForm = () => {
    setType("expense");
    setTitle("");
    setAmount("");
    setCategory("");
    setFrequency("monthly");
  };

  const handleCreate = async () => {
    if (!title.trim() || !amount || Number(amount) <= 0 || !category) {
      Alert.alert("Missing info", "Fill in a title, amount, and category.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await createRecurring({
        title: title.trim(),
        amount: Number(amount),
        type,
        category,
        frequency,
        startDate: new Date().toISOString(),
      });

      if (response.success) {
        resetForm();
        setShowForm(false);
        load();
      } else {
        Alert.alert("Error", response.message || "Could not create recurring transaction.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    await toggleRecurring(id);
    load();
  };

  const handleDelete = (item) => {
    Alert.alert("Delete", `Delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteRecurring(item._id);
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 items-center justify-center mr-3 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <Ionicons name="arrow-back" size={18} color="#2563eb" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Recurring</Text>
        </View>

        <TouchableOpacity onPress={() => setShowForm((prev) => !prev)} activeOpacity={0.8}>
          <Ionicons name={showForm ? "close-circle" : "add-circle"} size={32} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView className="px-6 pt-2" contentContainerStyle={{ paddingBottom: 32 }}>
        {showForm && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="flex-row mb-4 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              {["expense", "income"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    setType(t);
                    setCategory("");
                  }}
                  className={`flex-1 py-2 rounded-lg ${
                    type === t ? (t === "expense" ? "bg-red-500" : "bg-green-600") : ""
                  }`}
                >
                  <Text
                    className={`text-center font-semibold capitalize ${
                      type === t ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomInput placeholder="Title (e.g. Netflix)" value={title} onChangeText={setTitle} />
            <CustomInput
              placeholder="Amount"
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
            />

            <View className="flex-row flex-wrap mb-3">
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setCategory(item)}
                  className={`flex-row items-center px-3 py-2 rounded-full border mr-2 mb-2 ${
                    category === item ? "bg-blue-600 border-blue-600" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <Ionicons
                    name={CATEGORY_ICONS[item] || "pricetag"}
                    size={14}
                    color={category === item ? "#fff" : "#6b7280"}
                  />
                  <Text className={`ml-1 ${category === item ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row flex-wrap mb-4">
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setFrequency(f.key)}
                  className={`px-4 py-2 rounded-full border mr-2 mb-2 ${
                    frequency === f.key ? "bg-blue-600 border-blue-600" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <Text className={frequency === f.key ? "text-white" : "text-gray-600 dark:text-gray-300"}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <CustomButton title="Create" onPress={handleCreate} disabled={submitting} />
          </View>
        )}

        {items.length === 0 && !showForm && (
          <View className="items-center mt-8">
            <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-3">
              <Ionicons name="repeat-outline" size={28} color="#9ca3af" />
            </View>
            <Text className="text-center text-gray-400 dark:text-gray-500">
              No recurring transactions yet
            </Text>
          </View>
        )}

        {items.map((item) => (
          <View
            key={item._id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 flex-row items-center justify-between shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <View className="flex-1 pr-3">
              <Text className="font-semibold text-gray-900 dark:text-white">{item.title}</Text>
              <Text className="text-gray-400 dark:text-gray-500 text-xs capitalize">
                {item.category} • {item.frequency}
              </Text>
              <Text
                className={`text-sm font-semibold mt-1 ${
                  item.type === "income" ? "text-green-600" : "text-red-500"
                }`}
              >
                {item.type === "income" ? "+" : "-"}
                {formatCurrency(item.amount)}
              </Text>
            </View>

            <Switch value={item.active} onValueChange={() => handleToggle(item._id)} />

            <TouchableOpacity onPress={() => handleDelete(item)} className="ml-3">
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
