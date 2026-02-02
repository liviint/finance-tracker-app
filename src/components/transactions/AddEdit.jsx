import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card, BodyText,Input,TextArea , FormLabel} from "../ThemeProvider/components";
import { useSQLiteContext } from "expo-sqlite";
import { getTransactionByUuid,
        upsertTransaction,
      } from "../../db/transactionsDb";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import CategoriesPicker from "../common/CategoriesPicker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddEdit() {
  const {id:uuid} = useLocalSearchParams()
  const {globalStyles} = useThemeStyles()
  const db = useSQLiteContext()
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    category_uuid:"",
    type: "expense", 
    note: "",
    uuid:"",
    payee:"",
    date:new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [transactionDate, setTransactionDate] = useState(
    form.created_at ? new Date(form.created_at) : new Date()
  );


  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const updated = new Date(transactionDate);
      updated.setFullYear(selectedDate.getFullYear());
      updated.setMonth(selectedDate.getMonth());
      updated.setDate(selectedDate.getDate());
      setTransactionDate(updated);
      setForm(prev => ({...prev,date:updated}))
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updated = new Date(form.date);
      updated.setHours(selectedTime.getHours());
      updated.setMinutes(selectedTime.getMinutes());
      updated.setSeconds(selectedTime.getSeconds());
      setForm(prev => ({...prev,date:updated}))
    }
  };

  const handleCategoryChange = (selected) => {
    setForm((prev) => ({ ...prev, category_uuid: selected.uuid, category:selected.name, type:selected.type }))
  } 

const isFormValid = () => {
  if (!form.title.trim()) {
    Alert.alert("Missing title", "Please enter a title for the transaction.");
    return false;
  }

  const amount = Number(form.amount);
  if (!form.amount || isNaN(amount) || amount <= 0) {
    Alert.alert(
      "Invalid amount",
      "Please enter a valid amount greater than 0."
    );
    return false;
  }

  if (!form.category_uuid) {
    Alert.alert(
      "Category required",
      "Please select a category for this transaction."
    );
    return false;
  }


  if (!["income", "expense"].includes(form.type)) {
    Alert.alert("Invalid type", "Transaction type is invalid.");
    return false;
  }

  return true;
};


  const handleSave = async () => {
    if(!isFormValid()) return
    try {
      await upsertTransaction(db,form)
      router.push("/transactions")
    } catch (error) {
      console.log(error,"hello error creating a transaction")
    }
  }

  useEffect(() => {
    if(!uuid) return
    let getTransaction = async() => {
      let transaction = await getTransactionByUuid(db,uuid)
      let date = form.date ? new Date(form.date) : new Date()
      setForm({...transaction,date})
    }
    getTransaction()
  },[uuid])

  return (
    <ScrollView style={globalStyles.container}>
      <BodyText style={globalStyles.title}>
        {uuid ? "Edit Transaction" : "Add Transaction"}
      </BodyText>

      <Card >
        <View style={globalStyles.formGroup}>
          <FormLabel style={styles.label}>Title</FormLabel>
          <Input
            placeholder="e.g. Groceries, Salary"
            value={form.title}
            onChangeText={(v) => handleChange("title", v)}
            style={styles.input}
          />
        </View>

        <CategoriesPicker
          form={form}
          handleCategoryChange={handleCategoryChange}
        />

        <View style={globalStyles.formGroup}>
          <FormLabel >Amount</FormLabel>
          <Input
            placeholder="0"
            keyboardType="numeric"
            value={String(form.amount)}
            onChangeText={(v) => handleChange("amount", v)}
          />
        </View>

        <View style={globalStyles.formGroup}>
          <FormLabel >Payee</FormLabel>
          <Input
            placeholder="Payee (e.g Landlord)"
            value={form.payee || ""}
            onChangeText={(v) => handleChange("payee", v)}
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

        <View style={globalStyles.formGroup}>
          <FormLabel>Date & Time</FormLabel>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 4,
                alignItems: "center",
                ...globalStyles.formBorder
              }}
            >
              <BodyText>{transactionDate.toDateString()}</BodyText>
            </TouchableOpacity>

            {/* Time Button */}
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 4,
                borderRadius: 14,
                alignItems: "center",
                justifyContent:"center",
                ...globalStyles.formBorder
              }}
            >
              <BodyText>
                {form.date.getHours().toString().padStart(2, "0")}:
                {form.date.getMinutes().toString().padStart(2, "0")}
              </BodyText>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={form.date}
              mode="date"
              display="calendar"
              onChange={handleDateChange}
              maximumDate={new Date()} 
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={form.date}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
            />
          )}
        </View>


        <View style={globalStyles.formGroup}>
          <FormLabel >Note (optional)</FormLabel>
          <TextArea
            placeholder="Any extra details"
            value={form.note}
            onChangeText={(v) => handleChange("note", v)}
            multiline
          />
        </View>

        <TouchableOpacity style={globalStyles.primaryBtn} onPress={handleSave}>
          <Text style={globalStyles.primaryBtnText}>
            {uuid ? "Update Transaction" : "Save Transaction"}
          </Text>
        </TouchableOpacity>

      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});