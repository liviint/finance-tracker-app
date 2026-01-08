import { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card } from "../ThemeProvider/components";
import { useSQLiteContext } from "expo-sqlite";
import { createTransaction, getTransactionByUuid, updateTransaction } from "../../db/transactionsDb";

export default function AddEdit() {
  const {id:uuid} = useLocalSearchParams()
  const db = useSQLiteContext()
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense", 
    note: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      if(uuid){
        updateTransaction(db,uuid,form)
        Alert.alert("Updated", "Your changes have been saved.");
      }
      else {
        await createTransaction(db,form)
        Alert.alert("Saved", "Your transaction was created.");
      }
      router.push("/transactions")
    } catch (error) {
      console.log(error,"hello error creating a transaction")
    }
  }
  useEffect(() => {
    if(!uuid) return
    let getTransaction = async() => {
      let transaction = await getTransactionByUuid(db,uuid)
      console.log(transaction,"hello transaction")
      setForm(transaction)
    }
    getTransaction()
  },[uuid])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {uuid ? "Edit Transaction" : "Add Transaction"}
      </Text>
      <Text style={styles.subHeader}>Track your income or expenses</Text>

      <Card style={styles.card}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            placeholder="e.g. Groceries, Salary"
            value={form.title}
            onChangeText={(v) => handleChange("title", v)}
            style={styles.input}
          />
        </View>

        {/* Amount */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            placeholder="0"
            keyboardType="numeric"
            value={String(form.amount)}
            onChangeText={(v) => handleChange("amount", v)}
            style={styles.input}
          />
        </View>

        <View style={styles.typeRow}>
          <Pressable
            onPress={() => handleChange("type", "expense")}
            style={[styles.typeButton, form.type === "expense" && styles.expenseActive]}
          >
            <Text style={[styles.typeText, form.type === "expense" && styles.activeText]}>Expense</Text>
          </Pressable>

          <Pressable
            onPress={() => handleChange("type", "income")}
            style={[styles.typeButton, form.type === "income" && styles.incomeActive]}
          >
            <Text style={[styles.typeText, form.type === "income" && styles.activeText]}>Income</Text>
          </Pressable>
        </View>

        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            placeholder="e.g. Food, Transport"
            value={form.category}
            onChangeText={(v) => handleChange("category", v)}
            style={styles.input}
          />
        </View>

        {/* Note */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            placeholder="Any extra details"
            value={form.note}
            onChangeText={(v) => handleChange("note", v)}
            style={[styles.input, styles.textArea]}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>
            {uuid ? "Update Transaction" : "Save Transaction"}
          </Text>
        </TouchableOpacity>

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
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#FAF9F7",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  typeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  expenseActive: {
    backgroundColor: "#FF6B6B",
  },
  incomeActive: {
    backgroundColor: "#2E8B8B",
  },
  activeText: {
    color: "#FFFFFF",
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#333333",
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});