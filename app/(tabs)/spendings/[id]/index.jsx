import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Card } from "../../../../src/components/ThemeProvider/components";

// Dummy single transaction
const transaction = {
  id: "1",
  title: "Groceries",
  category: "Food",
  amount: -1200,
  date: "2026-01-05",
  note: "Weekly shopping at the local market",
  type: "expense", // income | expense
};

export default function FinanceEntryViewPage() {
  const isExpense = transaction.amount < 0;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction Details</Text>
      <Text style={styles.subHeader}>A closer look at this entry</Text>

      {/* Amount Highlight */}
      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>{isExpense ? "Expense" : "Income"}</Text>
        <Text style={[styles.amount, isExpense ? styles.expense : styles.income]}>
          {isExpense ? "-" : "+"}KES {Math.abs(transaction.amount).toLocaleString()}
        </Text>
      </Card>

      {/* Details */}
      <Card style={styles.detailsCard}>
        <DetailRow label="Title" value={transaction.title} />
        <DetailRow label="Category" value={transaction.category} />
        <DetailRow label="Date" value={transaction.date} />

        {transaction.note ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>Note</Text>
            <Text style={styles.noteText}>{transaction.note}</Text>
          </View>
        ) : null}
      </Card>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Pressable style={styles.editButton}>
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
  amountCard: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  amountLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 6,
  },
  amount: {
    fontSize: 28,
    fontWeight: "700",
  },
  income: {
    color: "#2E8B8B",
  },
  expense: {
    color: "#FF6B6B",
  },
  detailsCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  detailRow: {
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  noteBox: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  noteLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#2E8B8B",
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  deleteText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});