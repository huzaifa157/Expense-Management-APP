import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0891b2",
  "#db2777",
  "#65a30d",
];

const SIZE = 160;
const STROKE_WIDTH = 28;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// A simple SVG donut chart built from stacked circle strokes (no path/arc
// math needed) — one segment per item, sized proportionally to `percent`.
export default function PieChart({ data }) {
  if (!data || data.length === 0) return null;

  let cumulativePercent = 0;

  return (
    <View className="items-center mb-4">
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#e5e7eb"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />

        {data.map((item, index) => {
          const segmentLength = (item.percent / 100) * CIRCUMFERENCE;
          const offset = (cumulativePercent / 100) * CIRCUMFERENCE;
          cumulativePercent += item.percent;

          return (
            <Circle
              key={item.category}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${segmentLength} ${CIRCUMFERENCE - segmentLength}`}
              strokeDashoffset={-offset}
              fill="none"
              rotation="-90"
              origin={`${SIZE / 2}, ${SIZE / 2}`}
            />
          );
        })}
      </Svg>

      <View className="flex-row flex-wrap justify-center mt-4">
        {data.map((item, index) => (
          <View key={item.category} className="flex-row items-center mr-4 mb-2">
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: COLORS[index % COLORS.length],
              }}
              className="mr-1.5"
            />
            <Text className="text-gray-600 dark:text-gray-300 text-xs">
              {item.category} ({Math.round(item.percent)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
