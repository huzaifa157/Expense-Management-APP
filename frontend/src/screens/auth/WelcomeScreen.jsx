import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

const FEATURES = [
  { icon: "pie-chart", label: "Smart Budgets", color: "#60a5fa", bg: "rgba(96,165,250,0.16)" },
  { icon: "trending-up", label: "Spending Insights", color: "#34d399", bg: "rgba(52,211,153,0.16)" },
  { icon: "shield-checkmark", label: "Private & Secure", color: "#fbbf24", bg: "rgba(251,191,36,0.16)" },
];

function GlowCircle({ size, color, style }) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={["#0b1120", "#161135", "#3b1e63"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <StatusBar style="light" />

      <GlowCircle size={280} color="rgba(124,58,237,0.28)" style={{ top: -100, right: -80 }} />
      <GlowCircle size={220} color="rgba(37,99,235,0.22)" style={{ top: 260, left: -100 }} />
      <GlowCircle size={200} color="rgba(251,191,36,0.10)" style={{ bottom: -60, right: -60 }} />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 pt-4">
          {/* Brand */}
          <View className="flex-row items-center">
            <LinearGradient
              colors={["#fbbf24", "#f59e0b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Ionicons name="wallet" size={20} color="#1e1b0e" />
            </LinearGradient>
            <Text className="text-white text-lg font-bold tracking-wide">Centsible</Text>
          </View>

          {/* Hero mock card */}
          <View className="items-center mt-9 mb-8">
            <View
              className="w-full rounded-3xl p-6"
              style={{
                backgroundColor: "rgba(255,255,255,0.07)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.14)",
                shadowColor: "#000",
                shadowOpacity: 0.35,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 12 },
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text style={{ color: "rgba(255,255,255,0.6)" }} className="text-xs font-medium">
                  Total Balance
                </Text>
                <View
                  className="flex-row items-center px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(52,211,153,0.16)" }}
                >
                  <Ionicons name="arrow-up" size={10} color="#34d399" />
                  <Text style={{ color: "#34d399" }} className="text-[11px] font-semibold ml-0.5">
                    12.4%
                  </Text>
                </View>
              </View>

              <Text className="text-white text-4xl font-extrabold mt-1.5 tracking-tight">
                $4,285.50
              </Text>

              <View
                className="flex-row justify-between mt-6 pt-5"
                style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)" }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: "rgba(52,211,153,0.18)" }}
                  >
                    <Ionicons name="arrow-down" size={14} color="#34d399" />
                  </View>
                  <View>
                    <Text style={{ color: "rgba(255,255,255,0.55)" }} className="text-xs">
                      Income
                    </Text>
                    <Text className="text-white text-sm font-semibold">$6,120.00</Text>
                  </View>
                </View>

                <View className="flex-row items-center">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: "rgba(251,113,133,0.18)" }}
                  >
                    <Ionicons name="arrow-up" size={14} color="#fb7185" />
                  </View>
                  <View>
                    <Text style={{ color: "rgba(255,255,255,0.55)" }} className="text-xs">
                      Expenses
                    </Text>
                    <Text className="text-white text-sm font-semibold">$1,834.50</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Headline */}
          <Text className="text-white text-3xl font-extrabold tracking-tight leading-9">
            Take control of{"\n"}
            <Text style={{ color: "#fbbf24" }}>your money</Text>
          </Text>
          <Text
            style={{ color: "rgba(255,255,255,0.6)" }}
            className="text-base mt-3 leading-6"
          >
            Track spending, set budgets, and see exactly where your money goes — all in one
            simple app.
          </Text>

          {/* Feature chips */}
          <View className="flex-row mt-8">
            {FEATURES.map((feature) => (
              <View key={feature.label} className="flex-1 items-center mr-2">
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: feature.bg }}
                >
                  <Ionicons name={feature.icon} size={20} color={feature.color} />
                </View>
                <Text
                  style={{ color: "rgba(255,255,255,0.55)" }}
                  className="text-xs text-center"
                  numberOfLines={2}
                >
                  {feature.label}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-1" />

          {/* CTAs */}
          <TouchableOpacity onPress={() => navigation.navigate("Register")} activeOpacity={0.9}>
            <LinearGradient
              colors={["#fbbf24", "#f59e0b"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
                marginBottom: 12,
                shadowColor: "#f59e0b",
                shadowOpacity: 0.35,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
              }}
            >
              <Text className="text-[#1e1b0e] font-bold text-base tracking-wide">
                Get Started
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.7}
            className="items-center py-3 mb-4"
          >
            <Text style={{ color: "rgba(255,255,255,0.85)" }} className="font-semibold">
              I already have an account
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
