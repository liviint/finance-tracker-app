import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Card, BodyText, SecondaryText } from "../ThemeProvider/components";
import { useThemeStyles } from "../../hooks/useThemeStyles";

const screenWidth = Dimensions.get("window").width;

export default function CategoryPieChart({ data }) {
  const {colors} = useThemeStyles()
  if (!data || data.length === 0) {
    return (
      <Card>
        <SecondaryText>No expense data yet</SecondaryText>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: item.name,
    population: item.total,
    color: item.color || "#ccc",
    legendFontColor: colors.labelColor,
    legendFontSize: 12,
  }));

  return (
    <Card>
      <BodyText style={{ fontWeight: "700", marginBottom: 8 }}>
        Spending by Category
      </BodyText>

      <PieChart
        data={chartData}
        width={screenWidth - 48}
        height={220}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="10"
        chartConfig={{
          color: () => colors.text,
        }}
        absolute
      />
    </Card>
  );
}