import {useState, useEffect} from "react";
import { View, Text, StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Card } from "../../../../src/components/ThemeProvider/components";
import { useSQLiteContext } from "expo-sqlite";
import { getTransactionStats } from "../../../../src/db/transactionsDb";

export default function FinanceStatsPage() {
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
    <View style={styles.container}>
      <Text style={styles.header}>Financial Overview</Text>
      <Text style={styles.subHeader}>{stats.month}</Text>

      {/* Balance */}
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>KES {stats?.balance?.toLocaleString() ?? 0}</Text>
      </Card>

      {/* Income & Expense */}
      <View style={styles.row}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statAmount, styles.income]}>
            +KES {stats?.income?.toLocaleString() ?? 0}
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statAmount, styles.expense]}>
            -KES {stats?.expenses?.toLocaleString() ?? 0}
          </Text>
        </Card>
      </View>

      {/* Insight */}
      <Card style={styles.insightCard}>
        <Text style={styles.insightTitle}>Insight</Text>
        <Text style={styles.insightText}>
          Your highest spending category this month is
          <Text style={styles.insightHighlight}> {stats.topCategory}</Text>.
          Awareness is the first step toward balance.
        </Text>
      </Card>
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
    color: "#888",
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333333",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
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