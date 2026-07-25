import { useState } from "react";
import { Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";

import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/authService";

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Validation Error", "Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await registerUser(name.trim(), email.trim(), password);

      if (response.success) {
        await login(response.token, response.user);
      } else {
        Alert.alert("Registration Failed", response.message);
      }
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center bg-white dark:bg-gray-900 px-6">
      <Text className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Create Account
      </Text>

      <Text className="text-gray-500 dark:text-gray-400 mb-8">
        Sign up to get started
      </Text>

      <CustomInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <CustomInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <CustomInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <CustomButton
        title={submitting ? "Creating account..." : "Register"}
        onPress={handleRegister}
        disabled={submitting}
      />

      <Text
        className="text-center text-blue-600 mt-6"
        onPress={() => navigation.goBack()}
      >
        Already have an account? Login
      </Text>
    </SafeAreaView>
  );
}
