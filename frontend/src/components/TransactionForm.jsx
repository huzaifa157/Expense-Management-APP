import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";

import {
  CATEGORY_ICONS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../constants/categories";
import { useCurrency } from "../context/CurrencyContext";

const toDateInput = (date) => date.toISOString().split("T")[0];

const isValidDateInput = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(new Date(`${value}T00:00:00`).getTime());

export const resolveDateFromMode = (dateMode, customDate) => {
  if (dateMode === "yesterday") {
    return new Date(Date.now() - 24 * 60 * 60 * 1000);
  }
  if (dateMode === "custom") {
    return new Date(`${customDate}T00:00:00`);
  }
  return new Date();
};

const dateModeFromValue = (isoDate) => {
  if (!isoDate) {
    return { dateMode: "today", customDate: toDateInput(new Date()) };
  }

  const target = toDateInput(new Date(isoDate));

  if (target === toDateInput(new Date())) {
    return { dateMode: "today", customDate: target };
  }

  if (target === toDateInput(new Date(Date.now() - 24 * 60 * 60 * 1000))) {
    return { dateMode: "yesterday", customDate: target };
  }

  return { dateMode: "custom", customDate: target };
};

export default function TransactionForm({
  initialValues,
  submitLabel = "Save",
  submitting = false,
  onSubmit,
}) {
  const { currency } = useCurrency();
  const initialDate = dateModeFromValue(initialValues?.date);

  const [type, setType] = useState(initialValues?.type || "expense");
  const [title, setTitle] = useState(initialValues?.title || "");
  const [amount, setAmount] = useState(
    initialValues?.amount != null ? String(initialValues.amount) : ""
  );
  const [category, setCategory] = useState(initialValues?.category || "");
  const [notes, setNotes] = useState(initialValues?.notes || "");
  const [dateMode, setDateMode] = useState(initialDate.dateMode);
  const [customDate, setCustomDate] = useState(initialDate.customDate);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [receiptImage, setReceiptImage] = useState(initialValues?.receiptImage || "");

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const accentColor = type === "expense" ? "#ef4444" : "#16a34a";

  const errors = useMemo(() => {
    const next = {};

    if (!title.trim()) next.title = "Title is required";

    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      next.amount = "Enter a valid amount greater than 0";
    }

    if (!category) next.category = "Select a category";

    if (dateMode === "custom" && !isValidDateInput(customDate)) {
      next.date = "Enter a valid date (YYYY-MM-DD)";
    }

    return next;
  }, [title, amount, category, dateMode, customDate]);

  const handleAmountChange = (text) => {
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const sanitized =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
    setAmount(sanitized);
  };

  const resetForm = () => {
    const resetDate = dateModeFromValue(initialValues?.date);

    setType(initialValues?.type || "expense");
    setTitle(initialValues?.title || "");
    setAmount(initialValues?.amount != null ? String(initialValues.amount) : "");
    setCategory(initialValues?.category || "");
    setNotes(initialValues?.notes || "");
    setDateMode(resetDate.dateMode);
    setCustomDate(resetDate.customDate);
    setReceiptImage(initialValues?.receiptImage || "");
    setAttemptedSubmit(false);
  };

  const pickReceiptImage = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to attach a receipt photo.");
      return;
    }

    const pickerOptions = {
      mediaTypes: ["images"],
      quality: 0.5,
      base64: true,
    };

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!result.canceled && result.assets?.[0]?.base64) {
      const asset = result.assets[0];
      const mime = asset.mimeType || "image/jpeg";
      setReceiptImage(`data:${mime};base64,${asset.base64}`);
    }
  };

  const handleSubmit = () => {
    setAttemptedSubmit(true);

    if (Object.keys(errors).length > 0) {
      return;
    }

    onSubmit({
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date: resolveDateFromMode(dateMode, customDate).toISOString(),
      notes: notes.trim(),
      receiptImage,
    });
  };

  return (
    <View>
      <View className="flex-row mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5">
        <TouchableOpacity
          onPress={() => {
            setType("expense");
            setCategory("");
          }}
          activeOpacity={0.85}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-xl shadow-sm ${
            type === "expense" ? "bg-red-500" : "bg-transparent"
          }`}
        >
          <Ionicons
            name="arrow-down-circle"
            size={18}
            color={type === "expense" ? "#fff" : "#9ca3af"}
          />
          <Text
            className={`text-center font-semibold ml-2 ${
              type === "expense" ? "text-white" : "text-gray-500"
            }`}
          >
            Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setType("income");
            setCategory("");
          }}
          activeOpacity={0.85}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-xl shadow-sm ${
            type === "income" ? "bg-green-600" : "bg-transparent"
          }`}
        >
          <Ionicons
            name="arrow-up-circle"
            size={18}
            color={type === "income" ? "#fff" : "#9ca3af"}
          />
          <Text
            className={`text-center font-semibold ml-2 ${
              type === "income" ? "text-white" : "text-gray-500"
            }`}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <View className="items-center mb-2 bg-gray-50 dark:bg-gray-800 rounded-2xl py-6">
        <Text className="text-gray-400 dark:text-gray-500 text-sm mb-1 font-medium">Amount</Text>

        <View className="flex-row items-center">
          <Text className="text-3xl font-bold mr-1" style={{ color: accentColor }}>
            {currency.symbol}
          </Text>

          <TextInput
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor="#d1d5db"
            className="text-5xl font-bold"
            style={{ color: accentColor, minWidth: 80 }}
          />
        </View>
      </View>

      {!!(attemptedSubmit && errors.amount) && (
        <Text className="text-red-500 text-xs text-center mb-4">
          {errors.amount}
        </Text>
      )}

      <CustomInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        error={attemptedSubmit ? errors.title : undefined}
      />

      <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Category</Text>

      <View className="flex-row flex-wrap mb-1">
        {categories.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setCategory(item)}
            className={`flex-row items-center px-4 py-2 rounded-full border mr-2 mb-2 ${
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

      {!!(attemptedSubmit && errors.category) && (
        <Text className="text-red-500 text-xs mb-3 ml-1">{errors.category}</Text>
      )}

      <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2 mt-2">Date</Text>

      <View className="flex-row mb-1">
        {[
          { key: "today", label: "Today" },
          { key: "yesterday", label: "Yesterday" },
          { key: "custom", label: "Custom" },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => setDateMode(option.key)}
            className={`px-4 py-2 rounded-full border mr-2 mb-2 ${
              dateMode === option.key ? "bg-blue-600 border-blue-600" : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <Text className={dateMode === option.key ? "text-white" : "text-gray-600 dark:text-gray-300"}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {dateMode === "custom" && (
        <CustomInput
          placeholder="YYYY-MM-DD"
          value={customDate}
          onChangeText={setCustomDate}
          error={attemptedSubmit ? errors.date : undefined}
        />
      )}

      <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-1">Receipt</Text>
      <Text className="text-gray-400 dark:text-gray-500 text-xs mb-2">
        Optional — keep a photo for your records; it won't fill in the amount for you.
      </Text>

      {receiptImage ? (
        <View key="receipt-preview" className="mb-4">
          <Image
            source={{ uri: receiptImage }}
            style={{ width: "100%", height: 160, borderRadius: 16 }}
            resizeMode="cover"
          />
          <TouchableOpacity onPress={() => setReceiptImage("")} className="mt-2 self-start flex-row items-center">
            <Ionicons name="trash-outline" size={14} color="#ef4444" />
            <Text className="text-red-500 text-sm ml-1">Remove photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View key="receipt-picker" className="flex-row mb-4">
          <TouchableOpacity
            onPress={() => pickReceiptImage(true)}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-3.5 mr-2"
          >
            <Ionicons name="camera" size={18} color="#6b7280" />
            <Text className="text-gray-600 dark:text-gray-300 ml-2 font-medium">Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => pickReceiptImage(false)}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-3.5 ml-2"
          >
            <Ionicons name="image" size={18} color="#6b7280" />
            <Text className="text-gray-600 dark:text-gray-300 ml-2 font-medium">Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      <CustomInput
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <View className="flex-row mt-2">
        <View className="flex-1 mr-2">
          <CustomButton title="Reset" onPress={resetForm} variant="outline" />
        </View>

        <View className="flex-1 ml-2">
          <CustomButton title={submitLabel} onPress={handleSubmit} disabled={submitting} />
        </View>
      </View>
    </View>
  );
}
