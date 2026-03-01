import { PieChart } from "react-native-chart-kit";
import { Dimensions, ScrollView } from "react-native";
import { Card, BodyText, SecondaryText } from "../ThemeProvider/components";
import { useThemeStyles } from "../../hooks/useThemeStyles";

export default function CategoryPieChart({ data }) {
  const {colors} = useThemeStyles()

  const chartData = data.map((item) => ({
    name: item.name,
    population: item.total,
    color: item.color || "#ccc",
    legendFontColor: colors.labelColor,
    legendFontSize: 12,
  }));

  const chartWidth = Math.max(
    Dimensions.get("window").width,
    chartData.length * 10 
  );

  return (
    <Card>
      <BodyText style={{ fontWeight: "700", marginBottom: 8 }}>
        Spending by Category
      </BodyText>

        {!data || data.length === 0 ? 
          <SecondaryText>No expense data yet</SecondaryText>
          :
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <PieChart
              data={chartData}
              width={chartWidth}
              height={220}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              chartConfig={{
                color: () => colors.text,
              }}
              absolute
            />
          </ScrollView>
        }
        
    </Card>
  );
}