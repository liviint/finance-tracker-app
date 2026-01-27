import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";

// later:
// import { getDebtByUuid, deleteDebt, upsertDebt } from "@/db/debts";

export default function DebtDetailsScreen({ route, navigation }) {
  // const { uuid } = route.params;

  // dummy data for now
  const [debt, setDebt] = useState({
    // uuid,
    title: "KCB Loan",
    counterparty_name: "KCB Bank",
    counterparty_type: "company",
    amount: 25000,
    type: "owed",
    due_date: "2026-02-10",
    note: "Personal loan",
    is_paid: 0,
  });

  const [showOffsetModal, setShowOffsetModal] = useState(false);
  const [offsetAmount, setOffsetAmount] = useState("");

  const isOwed = debt.type === "owed";

  /* -------------------- Actions -------------------- */

  const togglePaid = async () => {
    const updated = {
      ...debt,
      is_paid: debt.is_paid ? 0 : 1,
      amount: debt.is_paid ? debt.amount : 0,
    };

    setDebt(updated);
    // await upsertDebt(db, updated);
  };

  const handleOffset = async () => {
    const offset = Number(offsetAmount);

    if (!offset || offset <= 0) {
      Alert.alert("Invalid amount", "Enter a valid offset amount.");
      return;
    }

    if (offset > debt.amount) {
      Alert.alert(
        "Too much",
        "Offset amount cannot be greater than remaining debt."
      );
      return;
    }

    const remaining = debt.amount - offset;

    const updatedDebt = {
      ...debt,
      amount: remaining,
      is_paid: remaining === 0 ? 1 : 0,
    };

    setDebt(updatedDebt);
    setOffsetAmount("");
    setShowOffsetModal(false);

    // await upsertDebt(db, updatedDebt);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Debt",
      "This debt will be removed. You can’t undo this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // await deleteDebt(db, uuid);
            navigation.goBack();
          },
        },
      ]
    );
  };

  /* -------------------- UI -------------------- */

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{debt.title}</Text>

      <Text
        style={[
          styles.amount,
          isOwed ? styles.owed : styles.owing,
        ]}
      >
        {isOwed ? "-" : "+"} KES {debt.amount}
      </Text>

      <Text style={styles.counterparty}>
        {debt.counterparty_type === "company" ? "🏢" : "👤"}{" "}
        {debt.counterparty_name}
      </Text>

      {/* Info */}
      <View style={styles.card}>
        <InfoRow label="Type" value={isOwed ? "I Owe" : "Owes Me"} />
        <InfoRow label="Due Date" value={debt.due_date ?? "N/A"} />
        <InfoRow
          label="Status"
          value={debt.is_paid ? "Paid" : "Unpaid"}
        />
        {debt.note ? (
          <InfoRow label="Note" value={debt.note} />
        ) : null}
      </View>

      {/* Offset */}
      {!debt.is_paid && (
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => setShowOffsetModal(true)}
        >
          <Text style={styles.secondaryText}>Offset Amount</Text>
        </TouchableOpacity>
      )}

      {/* Paid toggle */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          debt.is_paid ? styles.unpaidBtn : styles.paidBtn,
        ]}
        onPress={togglePaid}
      >
        <Text style={styles.actionText}>
          {debt.is_paid ? "Mark as Unpaid" : "Mark as Paid"}
        </Text>
      </TouchableOpacity>

      {/* Edit */}
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() =>
          navigation.navigate("AddDebt", {
            // uuid,
          })
        }
      >
        <Text style={styles.secondaryText}>Edit Debt</Text>
      </TouchableOpacity>

      {/* Delete */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={handleDelete}
      >
        <Text style={styles.deleteText}>Delete Debt</Text>
      </TouchableOpacity>

      {/* Offset Modal */}
      <Modal visible={showOffsetModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Offset Debt</Text>
            <Text style={styles.modalSub}>
              Remaining: KES {debt.amount}
            </Text>

            <TextInput
              value={offsetAmount}
              onChangeText={setOffsetAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.modalInput}
            />

            <TouchableOpacity
              style={styles.paidBtn}
              onPress={handleOffset}
            >
              <Text style={styles.actionText}>Apply Offset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowOffsetModal(false)}
            >
              <Text style={{ color: "#666" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------- Helpers -------------------- */

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FAF9F7",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  amount: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  owed: { color: "#FF6B6B" },
  owing: { color: "#2E8B8B" },
  counterparty: {
    marginTop: 4,
    color: "#666",
  },
  card: {
    marginTop: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  infoRow: { marginBottom: 12 },
  infoLabel: { fontSize: 12, color: "#999" },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  actionBtn: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  paidBtn: { backgroundColor: "#2E8B8B" },
  unpaidBtn: { backgroundColor: "#FF6B6B" },
  actionText: { color: "#FFF", fontWeight: "700" },
  secondaryBtn: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
  },
  secondaryText: { fontWeight: "600", color: "#333" },
  deleteBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  deleteText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalSub: {
    color: "#666",
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modalCancel: {
    marginTop: 12,
    alignItems: "center",
  },
});