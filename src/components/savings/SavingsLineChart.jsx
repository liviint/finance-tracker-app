import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useThemeStyles } from "../../hooks/useThemeStyles";

const screenWidth = Dimensions.get("window").width;

export default function SavingsLineChart({ data, color }) {
  const { isDark } = useThemeStyles();

  if (!data || data.length === 0) return null;

  return (
    <LineChart
      data={{
        labels: data.map(d =>
          new Date(d.date).toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric",
          })
        ),
        datasets: [
          {
            data: data.map(d => d.total),
            strokeWidth: 3,
          },
        ],
      }}
      width={screenWidth - 64}
      height={220}
      bezier
      withDots
      withInnerLines={false}
      withOuterLines={false}
      chartConfig={{
        backgroundGradientFrom: "transparent",
        backgroundGradientTo: "transparent",
        decimalPlaces: 0,
        color: () => color,
        labelColor: () => (isDark ? "#CCC" : "#666"),
        propsForDots: {
          r: "4",
          strokeWidth: "2",
          stroke: color,
        },
      }}
      style={{
        marginVertical: 8,
        borderRadius: 16,
      }}
    />
  );
}
