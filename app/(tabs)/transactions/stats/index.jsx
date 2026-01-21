import { useState, useEffect } from "react";
import { View, Dimensions, StyleSheet, ScrollView } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { BarChart } from "react-native-chart-kit";

import {
  Card,
  BodyText,
  SecondaryText,
} from "../../../../src/components/ThemeProvider/components";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import { getTransactionStats, getExpenseBreakdownByCategory } from "../../../../src/db/transactionsDb";
import CategoryPieChart from "../../../../src/components/transactions/CategoryPieChart";


const screenWidth = Dimensions.get("window").width;

export default function FinanceStatsPage() {
  const { globalStyles, colors } = useThemeStyles();
  const db = useSQLiteContext();
  const isFocused = useIsFocused();

  const [stats, setStats] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });

  const [categoryStats, setCategoryStats] = useState([]);


  useEffect(() => {
    const fetchStats = async () => {
      const summary = await getTransactionStats(db);
      const categories = await getExpenseBreakdownByCategory(db);

      setStats(summary);
      setCategoryStats(categories);
    };

    if (isFocused) fetchStats();
  }, [isFocused])

  const savingsRate =
    stats.income > 0
      ? Math.round(((stats.income - stats.expenses) / stats.income) * 100)
      : 0;

  const chartData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [stats.income, stats.expenses],
      },
    ],
  };

  return (
    <ScrollView style={globalStyles.container}>
      <BodyText style={globalStyles.title}>Financial Overview</BodyText>

      <Card style={styles.balanceCard}>
        <SecondaryText style={styles.balanceLabel}>
          Current Balance
        </SecondaryText>
        <BodyText
          style={[
            styles.balanceAmount,
            { color: stats.balance >= 0 ? "#2E8B8B" : "#FF6B6B" },
          ]}
        >
          KES {stats.balance.toLocaleString()}
        </BodyText>
      </Card>

      <View style={styles.row}>
        <Card style={styles.statCard}>
          <SecondaryText style={styles.statLabel}>Income</SecondaryText>
          <BodyText style={[styles.statAmount, styles.income]}>
            +KES {stats.income.toLocaleString()}
          </BodyText>
        </Card>

        <Card style={styles.statCard}>
          <SecondaryText style={styles.statLabel}>Expenses</SecondaryText>
          <BodyText style={[styles.statAmount, styles.expense]}>
            -KES {stats.expenses.toLocaleString()}
          </BodyText>
        </Card>
      </View>

      <Card>
        <SecondaryText style={styles.chartTitle}>
          Income vs Expenses
        </SecondaryText>

        <BarChart
          data={chartData}
          width={screenWidth - 48}
          height={220}
          fromZero
          showValuesOnTopOfBars
          chartConfig={{
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            decimalPlaces: 0,
            color: () => `${colors.tint}`,
            labelColor: () => colors.secondaryText,
            propsForBackgroundLines: {
              stroke: "#eee",
            },
          }}
          style={{ borderRadius: 16, marginTop: 12 }}
        />
      </Card>

      <CategoryPieChart data={categoryStats} />

      <Card style={styles.insightCard}>
        <BodyText style={styles.insightTitle}>Quick Insight</BodyText>

        <BodyText style={styles.insightText}>
          {stats.expenses > stats.income ? (
            <>
              You are spending{" "}
              <BodyText style={{...styles.insightHighlight,color:colors.labelColor}}>more than you earn</BodyText>.
              Consider reviewing your expenses.
            </>
          ) : (
            <>
              You are saving about{" "}
              <BodyText style={{...styles.insightHighlight,color:colors.labelColor}}>
                {savingsRate}%
              </BodyText>{" "}
              of your income. Great progress 💪
            </>
          )}
        </BodyText>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  income: {
    color: "#2E8B8B",
  },
  expense: {
    color: "#FF6B6B",
  },
  chartTitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  insightCard: {
    marginTop: 16,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
  },
  insightHighlight: {
    fontWeight: "700",
  },
});
