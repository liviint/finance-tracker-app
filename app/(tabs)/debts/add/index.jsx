import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";

// later you will import this
// import { upsertDebt } from "@/db/debts";

export default function AddDebtScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [counterpartyName, setCounterpartyName] = useState("");
  const [isCompany, setIsCompany] = useState(false);
  const [amount, setAmount] = useState("");
  const [isOwed, setIsOwed] = useState(true);
  const [note, setNote] = useState("");

  const handleSave = async () => {
    if (!title || !counterpartyName || !amount) return;

    const payload = {
      title,
      counterparty_name: counterpartyName,
      counterparty_type: isCompany ? "company" : "person",
      amount: Number(amount),
      type: isOwed ? "owed" : "owing",
      note,
    };

    console.log("Saving debt:", payload);

    // await upsertDebt(db, payload);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Debt</Text>

      {/* Title */}
      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. KCB Loan"
        style={styles.input}
      />

      {/* Counterparty */}
      <Text style={styles.label}>Who is this with?</Text>
      <TextInput
        value={counterpartyName}
        onChangeText={setCounterpartyName}
        placeholder="Person or company name"
        style={styles.input}
      />

      {/* Person / Company */}
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>
          {isCompany ? "Company" : "Person"}
        </Text>
        <Switch value={isCompany} onValueChange={setIsCompany} />
      </View>

      {/* Amount */}
      <Text style={styles.label}>Amount (KES)</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="0"
        keyboardType="numeric"
        style={styles.input}
      />

      {/* Owed / Owing */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            isOwed && styles.toggleActiveOwed,
          ]}
          onPress={() => setIsOwed(true)}
        >
          <Text style={styles.toggleText}>I Owe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            !isOwed && styles.toggleActiveOwing,
          ]}
          onPress={() => setIsOwed(false)}
        >
          <Text style={styles.toggleText}>Owes Me</Text>
        </TouchableOpacity>
      </View>

      {/* Note */}
      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Any extra info"
        style={[styles.input, { height: 80 }]}
        multiline
      />

      {/* Save */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Debt</Text>
      </TouchableOpacity>
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
  label: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
    color: "#555",
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: "#333",
  },
  toggleRow: {
    flexDirection: "row",
    marginVertical: 16,
  },
  toggleBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  toggleActiveOwed: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  toggleActiveOwing: {
    backgroundColor: "#2E8B8B",
    borderColor: "#2E8B8B",
  },
  toggleText: {
    color: "#FFF",
    fontWeight: "600",
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#FFF",
    fontWeight: "700",
  },
});