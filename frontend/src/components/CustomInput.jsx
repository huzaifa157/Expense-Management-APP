import { Text, TextInput, View } from "react-native";

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  multiline = false,
  error,
}) {
  return (
    <View className="mb-4">
      <TextInput
        className={`w-full border rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 ${
          multiline ? "h-24" : ""
        } ${error ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        autoCapitalize="none"
      />

      {!!error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
