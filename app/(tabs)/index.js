import { View, Text, FlatList, StyleSheet } from "react-native";
import { Card } from "../../src/components/ThemeProvider/components";

// Dummy data
const transactions = [
  { id: "1", title: "Groceries", category: "Food", amount: -1200, date: "2026-01-05" },
  { id: "2", title: "Salary", category: "Income", amount: 45000, date: "2026-01-01" },
  { id: "3", title: "Transport", category: "Travel", amount: -300, date: "2026-01-04" },
  { id: "4", title: "Internet", category: "Utilities", amount: -2500, date: "2026-01-03" },
];

export default function FinanceListPage() {
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.category} • {item.date}</Text>
        </View>
        <Text style={[styles.amount, item.amount < 0 ? styles.expense : styles.income]}>
          {item.amount < 0 ? "-" : "+"}KES {Math.abs(item.amount).toLocaleString()}
        </Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Finance Tracker</Text>
      <Text style={styles.subHeader}>Your recent transactions</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F7", // ZeniaHub background
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
  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  meta: {
    fontSize: 12,
    color: "#999999",
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  income: {
    color: "#2E8B8B", // ZeniaHub secondary
  },
  expense: {
    color: "#FF6B6B", // ZeniaHub primary
  },
});