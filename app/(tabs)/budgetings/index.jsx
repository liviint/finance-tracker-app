import { View, Text, FlatList, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { getBudgetsForMonth, getBudgetStatus } from "@/db/budgets";

export default function BudgetsListScreen({ navigation }) {
  const db = useSQLiteContext();
  const [budgets, setBudgets] = useState([]);

  const loadBudgets = async () => {
    const data = await getBudgetsForMonth(db);
    setBudgets(data);
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const renderItem = ({ item }) => {
    const status = getBudgetStatus(item.spent, item.budget_amount);

    return (
      <Pressable
        onPress={() =>
          navigation.navigate("BudgetDetails", { uuid: item.uuid })
        }
        style={{ padding: 16, borderBottomWidth: 1 }}
      >
        <Text style={{ fontWeight: "600" }}>{item.category_name}</Text>
        <Text>
          {item.spent} / {item.budget_amount}
        </Text>
        <Text>Status: {status}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
      />

      <Pressable
        onPress={() => navigation.navigate("AddEditBudget")}
        style={{
          padding: 16,
          backgroundColor: "#FF6B6B",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Add Budget
        </Text>
      </Pressable>
    </View>
  );
}
