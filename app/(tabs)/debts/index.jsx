import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const DUMMY_DEBTS = [
  {
    uuid: "1",
    title: "KCB Loan",
    counterparty_name: "KCB Bank",
    counterparty_type: "company",
    amount: 25000,
    type: "owed",
    is_paid: 0,
    due_date: "2026-02-10",
  },
  {
    uuid: "2",
    title: "Friend Loan",
    counterparty_name: "John Mwangi",
    counterparty_type: "person",
    amount: 5000,
    type: "owing",
    is_paid: 1,
    due_date: "2026-01-15",
  },
  {
    uuid: "3",
    title: "Fuliza",
    counterparty_name: "Safaricom",
    counterparty_type: "company",
    amount: 1200,
    type: "owed",
    is_paid: 0,
    due_date: "2026-01-30",
  },
];

export default function DebtsListScreen() {
  const renderItem = ({ item }) => {
    const isOwed = item.type === "owed";

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{item.title}</Text>
          <Text
            style={[
              styles.amount,
              isOwed ? styles.owed : styles.owing,
            ]}
          >
            {isOwed ? "-" : "+"} KES {item.amount}
          </Text>
        </View>

        <Text style={styles.counterparty}>
          {item.counterparty_name} ·{" "}
          {item.counterparty_type === "company" ? "🏢" : "👤"}
        </Text>

        <View style={styles.row}>
          <Text style={styles.dueDate}>
            Due: {item.due_date ?? "N/A"}
          </Text>

          <Text
            style={[
              styles.status,
              item.is_paid ? styles.paid : styles.unpaid,
            ]}
          >
            {item.is_paid ? "Paid" : "Unpaid"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Debts</Text>

      <FlatList
        data={DUMMY_DEBTS}
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FAF9F7",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  owed: {
    color: "#FF6B6B",
  },
  owing: {
    color: "#2E8B8B",
  },
  counterparty: {
    marginTop: 6,
    color: "#666",
  },
  dueDate: {
    marginTop: 8,
    color: "#999",
    fontSize: 12,
  },
  status: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  paid: {
    color: "#2E8B8B",
  },
  unpaid: {
    color: "#FF6B6B",
  },
});