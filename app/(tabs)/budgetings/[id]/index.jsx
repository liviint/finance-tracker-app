import { View, Text, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { getBudgetByUUID } from "../../../../src/db/budgetingDb";

export default function BudgetDetailsScreen({ route, navigation }) {
  const { uuid } = route.params;
  const db = useSQLiteContext();
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getBudgetByUUID(db, uuid);
      setBudget(data);
    })();
  }, [uuid]);

  if (!budget) return null;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>
        Budget Details
      </Text>

      <Text>Amount: {budget.amount}</Text>
      <Text>Period: {budget.period}</Text>
      <Text>Start Date: {budget.start_date}</Text>

      <Pressable
        onPress={() =>
          navigation.navigate("AddEditBudget", { uuid })
        }
        style={{ marginTop: 16 }}
      >
        <Text>Edit Budget</Text>
      </Pressable>

      <Pressable
        onPress={() =>
          navigation.navigate("DeleteBudget", { uuid })
        }
        style={{ marginTop: 16 }}
      >
        <Text style={{ color: "red" }}>Delete Budget</Text>
      </Pressable>
    </View>
  );
}
