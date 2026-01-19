import { View, Text, TextInput, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { upsertBudget, getBudgetByUUID } from "../../db/budgetingDb";
import {getMonthStart} from "../../helpers"

export default function AddEdit({ route, navigation }) {
  const db = useSQLiteContext();
  const uuid = route.params?.uuid;

  const [categoryId, setCategoryId] = useState(null);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!uuid) return;

    (async () => {
      const budget = await getBudgetByUUID(db, uuid);
      setCategoryId(budget.category_id);
      setAmount(String(budget.amount));
    })();
  }, [uuid]);

  const saveBudget = async () => {
    await upsertBudget({
      db,
      categoryId,
      amount: parseFloat(amount),
      startDate: getMonthStart(),
    });

    navigation.goBack();
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>
        {uuid ? "Edit Budget" : "Add Budget"}
      </Text>

      {/* Replace with category picker */}
      <Text>Category ID</Text>
      <TextInput
        value={categoryId ? String(categoryId) : ""}
        onChangeText={(v) => setCategoryId(Number(v))}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />

      <Text>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 8 }}
      />

      <Pressable
        onPress={saveBudget}
        style={{
          marginTop: 16,
          backgroundColor: "#2E8B8B",
          padding: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>Save</Text>
      </Pressable>
    </View>
  );
}
