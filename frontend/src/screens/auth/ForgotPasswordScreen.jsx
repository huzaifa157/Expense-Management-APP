import { useState } from "react";
import { Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import AppLogo from "../../components/AppLogo";
import { forgotPassword } from "../../services/authService";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Validation Error", "Please enter your email.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await forgotPassword(email.trim());

      if (response.success) {
        Alert.alert("Check your email", response.message);
        navigation.navigate("ResetPassword", { email: email.trim() });
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
        Forgot Password
      </Text>

      <Text className="text-gray-400 dark:text-gray-500 mb-8">
        Enter your email and we'll send you a reset code.
      </Text>

      <CustomInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <CustomButton
        title={submitting ? "Sending..." : "Send reset code"}
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
