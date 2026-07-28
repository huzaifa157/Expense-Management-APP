import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AppLogo({ size = 64 }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
      className="bg-blue-600 items-center justify-center shadow-sm mb-6"
    >
      <Ionicons name="wallet" size={size * 0.5} color="#fff" />
    </View>
  );
}
