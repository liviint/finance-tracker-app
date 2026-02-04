import { useState, useEffect } from "react";
import { View, Alert, ScrollView } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

import {
  FormLabel,
  CustomInput,
  CustomButton,
  CustomPicker,
} from "../ThemeProvider/components";

import { upsertTransactionTemplate } from "../../db/transactionTemplatesDb";
import { getCategories } from "../../db/transactionsDb";

export default function AddTransactionTemplateScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [form, setForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "",
    category_uuid: "",
    payee: "",
    note: "",
  });

  const [categories, setCategories] = useState([]);

  /* ============================================================
     ✅ Load Categories for Picker
  ============================================================ */
  useEffect(() => {
    const loadCategories = async () => {
      const result = await getCategories(db);
      setCategories(result);
    };

    loadCategories();
  }, []);

  /* ============================================================
     ✅ Handle Form Change
  ============================================================ */
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ============================================================
     ✅ Save Template
  ============================================================ */
  const handleSave = async () => {
    if (!form.title.trim()) {
      return Alert.alert("Validation Error", "Template title is required.");
    }

    if (!form.type) {
      return Alert.alert("Validation Error", "Transaction type is required.");
    }

    await upsertTransactionTemplate(db, {
      title: form.title,
      amount: form.amount ? parseFloat(form.amount) : null,
      type: form.type,

      category: form.category,
      category_uuid: form.category_uuid,

      payee: form.payee,
      note: form.note,
    });

    Alert.alert("Success ✅", "Template saved successfully!");

    navigation.goBack();
  };

  /* ============================================================
     ✅ UI
  ============================================================ */
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {/* Title */}
      <View style={{ marginBottom: 16 }}>
        <FormLabel>Template Title</FormLabel>
        <CustomInput
          placeholder="e.g. Rent Payment"
          value={form.title}
          onChangeText={(text) => handleChange("title", text)}
        />
      </View>

      {/* Amount */}
      <View style={{ marginBottom: 16 }}>
        <FormLabel>Amount (Optional)</FormLabel>
        <CustomInput
          placeholder="e.g. 25000"
          keyboardType="numeric"
          value={form.amount}
          onChangeText={(text) => handleChange("amount", text)}
        />
      </View>

      {/* Type */}
      <View style={{ marginBottom: 16 }}>
        <FormLabel>Type</FormLabel>
        <CustomPicker
          selectedValue={form.type}
          onValueChange={(value) => handleChange("type", value)}
          items={[
            { label: "Expense", value: "expense" },
            { label: "Income", value: "income" },
          ]}
        />
      </View>

      {/* Category */}
      <View style={{ marginBottom: 16 }}>
        <FormLabel>Category</FormLabel>
        <CustomPicker
          selectedValue={form.category_uuid}
          onValueChange={(value) => {
            const selected = categories.find((c) => c.uuid === value);

            handleChange("category_uuid", value);
            handleChange("category", selected?.name || "");
          }}
          items={[
            { label: "Select Category", value: "" },
            ...categories.map((cat) => ({
              label: cat.name,
              value: cat.uuid,
            })),
          ]}
        />
      </View>

      {/* Payee */}
      <View style={{ marginBottom: 16 }}>
        <FormLabel>Payee (Optional)</FormLabel>
        <CustomInput
          placeholder="e.g. Landlord, Safaricom"
          value={form.payee}
          onChangeText={(text) => handleChange("payee", text)}
        />
      </View>

      {/* Note */}
      <View style={{ marginBottom: 16 }}>
        <FormLabel>Note (Optional)</FormLabel>
        <CustomInput
          placeholder="Extra details..."
          value={form.note}
          onChangeText={(text) => handleChange("note", text)}
          multiline
        />
      </View>

      {/* Save Button */}
      <CustomButton title="Save Template" onPress={handleSave} />
    </ScrollView>
  );
}
