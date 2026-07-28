import { useState } from "react";
import { Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import AppLogo from "../../components/AppLogo";
import { resetPassword } from "../../services/authService";

export default function ResetPasswordScreen({ navigation, route }) {
  const { email } = route.params;

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (code.trim().length !== 6 || newPassword.length < 6) {
      Alert.alert(
        "Validation Error",
        "Enter the 6-digit code and a new password (at least 6 characters)."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await resetPassword(email, code.trim(), newPassword);

      if (response.success) {
        Alert.alert("Success", response.message, [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("Failed", response.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center bg-white dark:bg-gray-900 px-6">
      <AppLogo />

      <Text className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">
        Reset Password
      </Text>

      <Text className="text-gray-400 dark:text-gray-500 mb-8">
        Enter the 6-digit code sent to {email} and choose a new password.
      </Text>

      <CustomInput
        placeholder="6-digit code"
        value={code}
        onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ""))}
        keyboardType="number-pad"
      />

      <CustomInput
        placeholder="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <CustomButton
        title={submitting ? "Resetting..." : "Reset Password"}
        onPress={handleSubmit}
        disabled={submitting}
      />

      <Text
        className="text-center text-blue-600 mt-6"
        onPress={() => navigation.navigate("Login")}
      >
        Back to Login
      </Text>
    </SafeAreaView>
  );
}
