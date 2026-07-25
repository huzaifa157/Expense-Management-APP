import { TouchableOpacity, Text } from "react-native";

export default function CustomButton({
  title,
  onPress,
  disabled = false,
  variant = "primary",
}) {
  const isOutline = variant === "outline";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`p-4 rounded-xl items-center justify-center ${
        isOutline
          ? "bg-transparent border border-gray-300 dark:border-gray-600"
          : disabled
          ? "bg-blue-300 dark:bg-blue-800"
          : "bg-blue-600"
      }`}
    >
      <Text
        className={`text-center font-bold text-lg ${
          isOutline ? "text-gray-600 dark:text-gray-300" : "text-white"
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
