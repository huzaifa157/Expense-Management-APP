import { TouchableOpacity, Text } from "react-native";

export default function CustomButton({
  title,
  onPress,
  disabled = false,
  variant = "primary",
}) {
  const isOutline = variant === "outline";

  // Keep "shadow-sm" present in both the enabled and disabled states of the
  // primary variant. Tailwind's shadow utilities compile to CSS custom
  // properties, and NativeWind only allows a component to start setting CSS
  // variables during its initial render — toggling the class on afterwards
  // (e.g. when `disabled` flips true while submitting) triggers a dev-only
  // "upgrade" warning whose logger crashes while serialising the props,
  // surfacing as a bogus "Couldn't find a navigation context" render error.
  const variantClass = isOutline
    ? "bg-transparent border border-gray-300 dark:border-gray-600"
    : `shadow-sm ${disabled ? "bg-blue-300 dark:bg-blue-800" : "bg-blue-600"}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      className={`p-4 rounded-2xl items-center justify-center ${variantClass}`}
    >
      <Text
        className={`text-center font-bold text-base tracking-wide ${
          isOutline ? "text-gray-600 dark:text-gray-300" : "text-white"
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
