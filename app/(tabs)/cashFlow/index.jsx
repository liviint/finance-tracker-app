import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { Card } from "../../../src/components/ThemeProvider/components";
import { useRouter } from "expo-router";

const transactions = [
  { id: "1", title: "Groceries", category: "Food", amount: -1200, date: "2026-01-05" },
  { id: "2", title: "Salary", category: "Income", amount: 45000, date: "2026-01-01" },
  { id: "3", title: "Transport", category: "Travel", amount: -300, date: "2026-01-04" },
  { id: "4", title: "Internet", category: "Utilities", amount: -2500, date: "2026-01-03" },
];

export default function FinanceListPage() {
  const router = useRouter();

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
      {/* Header row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Finance Tracker</Text>
          <Text style={styles.subHeader}>Your recent transactions</Text>
        </View>

        <Pressable
          onPress={() => router.push("/finance/stats")}
          style={styles.statsButton}
        >
          <Text style={styles.statsText}>Stats</Text>
        </Pressable>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 96 }}
      />

      {/* Floating Add Button */}
      <Pressable
        onPress={() => router.push("/cashFlow/add")}
        style={styles.addButton}
      >
        <Text style={styles.addText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F7",
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
  },
  subHeader: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statsButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  statsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E8B8B",
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
    color: "#2E8B8B",
  },
  expense: {
    color: "#FF6B6B",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginTop: -2,
  },
});