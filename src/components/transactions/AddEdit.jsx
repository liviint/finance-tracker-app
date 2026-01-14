import { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card, BodyText,Input,TextArea , FormLabel} from "../ThemeProvider/components";
import { useSQLiteContext } from "expo-sqlite";
import { createTransaction, 
        getTransactionByUuid, 
        updateTransaction,
        getCategories,
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
  });
  const [categories,setCategories] = useState([])

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

  useEffect(() => {
    let fetchCategories = async () => {
      try {
        let categories = await getCategories(db)
        console.log(categories,"hello categories")
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


      {/* Category */}
      <View style={globalStyles.formGroup}>
        <FormLabel>Category</FormLabel>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#DDD",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Picker
            selectedValue={form.category_uuid}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, category_uuid: value.uuid, category:value.name }))
            }
          >
            <Picker.Item label="Select category" value={null} />

            {categories.map((cat) => (
              <Picker.Item
                key={cat.uuid}
                label={`${cat.icon} ${cat.name}`}
                value={cat}
              />
            ))}
          </Picker>
        </View>
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