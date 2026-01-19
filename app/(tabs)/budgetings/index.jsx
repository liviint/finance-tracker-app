import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { getBudgetsForMonth, getBudgetStatus } from "../../../src/db/budgetingDb";
import { BodyText } from "../../../src/components/ThemeProvider/components";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";

export default function BudgetsListScreen({ navigation }) {
  const router = useRouter()
  const {globalStyles} = useThemeStyles()
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
        onPress={() => router.push(`/budgeting/${item.uuid}`)}
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
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>
          My Budgets
      </BodyText>
      <Pressable
        onPress={() => router.push(`/budgetings/add`)}
        style={{ ...globalStyles.primaryBtn, marginBottom: 16 }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Add Budget
        </Text>
      </Pressable>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
      />
    </View>
  );
}
