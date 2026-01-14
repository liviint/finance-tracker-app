import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card, BodyText,Input,TextArea , FormLabel, CustomPicker} from "../ThemeProvider/components";
import { useSQLiteContext } from "expo-sqlite";
import { getTransactionByUuid,
        getCategories,
        upsertTransaction,
      } from "../../db/transactionsDb";
import { useThemeStyles } from "../../hooks/useThemeStyles";

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
  });
  const [categories,setCategories] = useState([])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
    console.log(form,"hello form")
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
      console.log(transaction,"hello transaction")
      setForm(transaction)
    }
    getTransaction()
  },[uuid])

  useEffect(() => {
    let fetchCategories = async () => {
      try {
        let categories = await getCategories(db)
        setCategories(categories)
      } catch (error) {
        console.log(error,"hello error")
      }
    }
    fetchCategories()
  },[])

  return (
    <View style={globalStyles.container}>
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

      <View style={globalStyles.formGroup}>
        <FormLabel>Category</FormLabel>

        <View
        >
          <CustomPicker
            selectedValue={categories.find(cate => cate.uuid === form.category_uuid)}
            onValueChange={(value) => handleCategoryChange(value)}
          >
            <Picker.Item label="Select category" value={null} />

            {categories.map((cat) => (
              <Picker.Item
                key={cat.uuid}
                label={`${cat.icon} ${cat.name}`}
                value={cat}
              />
            ))}
          </CustomPicker>
        </View>
      </View>

        {/* Amount */}
        <View style={globalStyles.formGroup}>
          <FormLabel >Amount</FormLabel>
          <Input
            placeholder="0"
            keyboardType="numeric"
            value={String(form.amount)}
            onChangeText={(v) => handleChange("amount", v)}
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

        {/* Note */}
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
    </View>
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