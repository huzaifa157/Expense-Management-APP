import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TransactionForm from "../components/TransactionForm";
import { deleteExpense, updateExpense } from "../services/expenseService";

export default function EditTransactionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { expense } = route.params;

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);

    try {
      const response = await updateExpense(expense._id, payload);

      if (response.success) {
        Alert.alert("Success", "Transaction updated successfully.");
        navigation.goBack();
      } else {
        Alert.alert("Failed", response.message || "Could not update transaction.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Transaction", `Delete "${expense.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);

          try {
            await deleteExpense(expense._id);
            navigation.goBack();
          } catch (error) {
            console.log(error);
            Alert.alert("Error", "Could not delete transaction.");
            setDeleting(false);
          }
        },
      },
    ]);
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
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Transaction
            </Text>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              className="flex-row items-center"
            >
              <Ionicons name="trash" size={16} color="#ef4444" />
              <Text className="text-red-500 text-xs ml-1">
                {deleting ? "Deleting..." : "Delete"}
              </Text>
            </TouchableOpacity>
          </View>

          <TransactionForm
            initialValues={expense}
            submitting={submitting}
            submitLabel={submitting ? "Updating..." : "Update"}
            onSubmit={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
