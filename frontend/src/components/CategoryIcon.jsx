import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CATEGORY_ICONS, CATEGORY_COLORS } from "../constants/categories";

export default function CategoryIcon({ category, size = 40 }) {
  const color = CATEGORY_COLORS[category] || "#64748b";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${color}1A`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={CATEGORY_ICONS[category] || "pricetag"} size={size * 0.45} color={color} />
    </View>
  );
}
