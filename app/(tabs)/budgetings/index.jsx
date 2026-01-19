import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  getBudgetsForPeriod,
  getBudgetStatus,
} from "../../../src/db/budgetingDb";
import { BodyText } from "../../../src/components/ThemeProvider/components";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";

const PERIODS = ["daily", "weekly", "monthly"];

export default function BudgetsListScreen() {
  const router = useRouter();
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();

  const [budgets, setBudgets] = useState([]);
  const [period, setPeriod] = useState("monthly");

  const loadBudgets = async () => {
    const data = await getBudgetsForPeriod(db, period);
    setBudgets(data);
  };

  useEffect(() => {
    loadBudgets();
  }, [period]);

  const renderItem = ({ item }) => {
    const status = getBudgetStatus(item.spent, item.budget_amount);
    const percent = Math.min(
      Math.round((item.spent / item.budget_amount) * 100),
      100
    );

    return (
      <Pressable
        onPress={() => router.push(`/budgeting/${item.uuid}`)}
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <Text style={{ fontWeight: "600" }}>
          {item.category_name}
        </Text>

        <Text>
          {item.spent} / {item.budget_amount}
        </Text>

        <Text>
          {percent}% used • {status}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>
        My Budgets
      </BodyText>

      {/* Period Selector */}
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {PERIODS.map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={{
              flex: 1,
              padding: 10,
              marginRight: 8,
              borderRadius: 8,
              backgroundColor:
                period === p ? "#2E8B8B" : "#EEE",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: period === p ? "#FFF" : "#333",
                fontWeight: "600",
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() => router.push(`/budgeting/add`)}
        style={{ ...globalStyles.primaryBtn, marginBottom: 16 }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Add {period} Budget
        </Text>
      </Pressable>

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
        ListEmptyComponent={
          <BodyText style={{ textAlign: "center", marginTop: 32 }}>
            No {period} budgets yet
          </BodyText>
        }
      />
    </View>
  );
}
