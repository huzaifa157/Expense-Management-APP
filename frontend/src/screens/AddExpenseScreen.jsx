import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TransactionForm from "../components/TransactionForm";
import { createExpense } from "../services/expenseService";
import { getBudgets } from "../services/budgetService";

export default function AddExpenseScreen() {
  const navigation = useNavigation();
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const checkBudgetAndAlert = async (category) => {
    try {
      const response = await getBudgets();
      if (!response.success) return;

      const relevant = response.data.filter(
        (b) => b.category === category || b.category === "Overall"
      );
      const overLimit = relevant.find((b) => b.percent >= 100);
      const nearLimit = relevant.find((b) => b.percent >= 80);

      if (overLimit) {
        Alert.alert(
          "Budget exceeded",
          `You've gone over your ${overLimit.category} budget for this month.`
        );
      } else if (nearLimit) {
        Alert.alert(
          "Approaching budget limit",
          `You've used ${nearLimit.percent}% of your ${nearLimit.category} budget this month.`
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      const response = await createExpense(payload);

      if (response.success) {
        // Force TransactionForm to remount so the amount, title, and any
        // attached receipt photo don't linger — bottom tab screens stay
        // mounted when you switch tabs, so state wouldn't clear otherwise.
        setFormKey((prev) => prev + 1);

        if (payload.type === "expense") {
          await checkBudgetAndAlert(payload.category);
        }

        Alert.alert("Success", "Transaction added successfully.");
        navigation.navigate("Home");
      } else {
        Alert.alert("Failed", response.message || "Could not add transaction.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="px-6 pt-4"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Add Transaction
          </Text>

          <TransactionForm
            key={formKey}
            submitting={submitting}
            submitLabel={submitting ? "Saving..." : "Save"}
            onSubmit={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
