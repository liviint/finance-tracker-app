import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import {
  BodyText,
  FormLabel,
  Input,
  Card,
} from "../ThemeProvider/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import uuid from "react-native-uuid";

import {
  upsertBudget,
  getBudgetByUUID,
} from "../../db/budgetingDb";
import { getCategories } from "../../db/transactionsDb";
import { normalizeStartDate } from "../../helpers";

export default function AddEditBudget() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { globalStyles } = useThemeStyles();
  const { uuid: budgetUUID } = useLocalSearchParams();

  const initialForm = {
    category_uuid: "",
    amount: "",
    period: "monthly",
    date: new Date(),
    uuid: "",
  };

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories(db);
      setCategories(data.filter((c) => c.type === "expense"));
    };
    loadCategories();
  }, []);

  // Load budget (edit mode)
  useEffect(() => {
    if (!budgetUUID) return;

    const loadBudget = async () => {
      const budget = await getBudgetByUUID(db, budgetUUID);

      setForm({
        uuid: budget.uuid,
        category_uuid: budget.category_uuid,
        amount: String(budget.amount),
        period: budget.period,
        date: new Date(budget.start_date),
      });
    };

    loadBudget();
  }, [budgetUUID]);

  const saveBudget = async () => {
    if (!form.category_uuid) {
      Alert.alert("Validation", "Please select a category");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      Alert.alert("Validation", "Amount must be greater than zero");
      return;
    }

    try {
      const budgetUuid = form.uuid || uuid.v4();
      const startDate = normalizeStartDate(form.date, form.period);

      await upsertBudget({
        db,
        uuid: budgetUuid,
        categoryUUID: form.category_uuid,
        amount: Number(form.amount),
        period: form.period,
        startDate,
      });

      router.back();
      setForm(initialForm);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save budget");
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <BodyText style={globalStyles.title}>
        {budgetUUID ? "Edit Budget" : "Add Budget"}
      </BodyText>

      <Card>
        {/* CATEGORY */}
        <View style={globalStyles.formGroup}>
          <FormLabel>Category</FormLabel>
          {categories.map((cat) => {
            const selected = form.category_uuid === cat.uuid;

            return (
              <TouchableOpacity
                key={cat.uuid}
                onPress={() =>
                  handleFormChange("category_uuid", cat.uuid)
                }
                style={{
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 8,
                  backgroundColor: selected ? cat.color : "#EEE",
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    color: selected ? "#FFF" : "#333",
                  }}
                >
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* AMOUNT */}
        <View style={globalStyles.formGroup}>
          <FormLabel>Amount</FormLabel>
          <Input
            value={form.amount}
            keyboardType="numeric"
            onChangeText={(v) => handleFormChange("amount", v)}
            placeholder="e.g. 5000"
          />
        </View>

        {/* PERIOD */}
        <View style={globalStyles.formGroup}>
          <FormLabel>Period</FormLabel>
          <View style={{ flexDirection: "row" }}>
            {["daily", "weekly", "monthly"].map((p) => {
              const selected = form.period === p;

              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => handleFormChange("period", p)}
                  style={{
                    flex: 1,
                    padding: 12,
                    marginRight: p !== "monthly" ? 8 : 0,
                    borderRadius: 10,
                    backgroundColor: selected ? "#2E8B8B" : "#EEE",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: "600",
                      color: selected ? "#FFF" : "#333",
                    }}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SAVE */}
        <TouchableOpacity
          onPress={saveBudget}
          style={globalStyles.primaryBtn}
        >
          <Text style={globalStyles.primaryBtnText}>
            {budgetUUID ? "Update Budget" : "Save Budget"}
          </Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}
