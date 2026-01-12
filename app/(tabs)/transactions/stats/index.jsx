import {useState, useEffect} from "react";
import { View, StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Card, BodyText , SecondaryText} from "../../../../src/components/ThemeProvider/components";
import { useSQLiteContext } from "expo-sqlite";
import { getTransactionStats } from "../../../../src/db/transactionsDb";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";

export default function FinanceStatsPage() {
  const {globalStyles} = useThemeStyles()
  const [stats,setStats] = useState({})
  const db = useSQLiteContext()

  useEffect(() => {
    let fetchStats = async () => {
      try {
        let stats = await getTransactionStats(db)
        setStats(stats)
      } catch (error) {
        console.log(error,"hello fetch stats error")
      }
    }
    fetchStats()
  },[useIsFocused])

  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>Financial Overview</BodyText>
      <SecondaryText style={globalStyles.subTitle}>{stats.month}</SecondaryText>

      {/* Balance */}
      <Card >
        <SecondaryText style={styles.balanceLabel}>Current Balance</SecondaryText>
        <BodyText style={styles.balanceAmount}>KES {stats?.balance?.toLocaleString() ?? 0}</BodyText>
      </Card>

      {/* Income & Expense */}
      <View style={styles.row}>
        <Card style={styles.statCard}>
          <SecondaryText style={styles.statLabel}>Income</SecondaryText>
          <BodyText style={[styles.statAmount, styles.income]}>
            +KES {stats?.income?.toLocaleString() ?? 0}
          </BodyText>
        </Card>

        <Card style={styles.statCard}>
          <SecondaryText style={styles.statLabel}>Expenses</SecondaryText>
          <BodyText style={[styles.statAmount, styles.expense]}>
            -KES {stats?.expenses?.toLocaleString() ?? 0}
          </BodyText>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F7",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  balanceCard: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
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
    marginBottom: 8,
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
  insightCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  insightHighlight: {
    fontWeight: "700",
    color: "#333333",
  },
});