import { PieChart } from "react-native-chart-kit";
import { Dimensions, View } from "react-native";
import { Card, BodyText, SecondaryText } from "../ThemeProvider/components";

const screenWidth = Dimensions.get("window").width;

export default function CategoryPieChart({ data }) {
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
    legendFontColor: "#333",
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
          color: () => "#000",
        }}
        absolute
      />
    </Card>
  );
}