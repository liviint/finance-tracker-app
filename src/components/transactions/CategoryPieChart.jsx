import { PieChart } from "react-native-chart-kit";
import { Dimensions, ScrollView } from "react-native";
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

  const chartWidth = Math.max(
    Dimensions.get("window").width,
    chartData.length * 10 
  );



  return (
    <Card>
      <BodyText style={{ fontWeight: "700", marginBottom: 8 }}>
        Spending by Category
      </BodyText>

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
        
    </Card>
  );
}

{/* <ChartCard title="Entries Per Month">
        {
          width => {
            const minWidth = Math.max(width,monthLabels.length * 60)
            return (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={{
                    labels: monthLabels,
                    datasets: [{ data: monthCounts }],
                  }}
                  width={minWidth}
                  height={260}
                  fromZero
                  chartConfig={chartConfig("#FF6B6B",colors)}
                  verticalLabelRotation={0}
                  style={styles.chart}
              />
              </ScrollView>
            )
          }
        }
      </ChartCard> */}