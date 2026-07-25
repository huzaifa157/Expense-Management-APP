import { useState } from "react";
import { Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";

import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await loginUser(email.trim(), password);

      if (response.success) {
        await login(response.token, response.user);
      } else {
        Alert.alert("Login Failed", response.message);
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
        Welcome Back 👋
      </Text>

      <Text className="text-gray-500 dark:text-gray-400 mb-8">
        Sign in to continue
      </Text>

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
        title={submitting ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={submitting}
      />

      <Text
        className="text-center text-blue-600 mt-6"
        onPress={() => navigation.navigate("Register")}
      >
        Don&apos;t have an account? Register
      </Text>
    </SafeAreaView>
  );
}
