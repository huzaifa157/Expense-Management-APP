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

export default function AddExpenseScreen() {
  const navigation = useNavigation();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      const response = await createExpense(payload);

      if (response.success) {
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
            submitting={submitting}
            submitLabel={submitting ? "Saving..." : "Save"}
            onSubmit={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
