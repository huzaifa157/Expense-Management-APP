import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  multiline = false,
  error,
}) {
  const [isHidden, setIsHidden] = useState(secureTextEntry);

  return (
    <View className="mb-4">
      <View className="justify-center">
        <TextInput
          className={`w-full border rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 ${
            secureTextEntry ? "pr-12" : ""
          } ${multiline ? "h-24" : ""} ${
            error ? "border-red-400" : "border-gray-200 dark:border-gray-700"
          }`}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && isHidden}
          keyboardType={keyboardType}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          autoCapitalize="none"
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsHidden((prev) => !prev)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="absolute right-4"
          >
            <Ionicons
              name={isHidden ? "eye-off" : "eye"}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}
      </View>

      {!!error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
