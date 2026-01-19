import { View, Text, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  getBudgetsForPeriod,
  getBudgetStatus,
} from "../../../src/db/budgetingDb";
import { BodyText, Card } from "../../../src/components/ThemeProvider/components";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";

const PERIODS = ["daily", "weekly", "monthly"];

export default function BudgetsListScreen() {
  const router = useRouter();
  const isFocused = useIsFocused()
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();

  const [budgets, setBudgets] = useState([]);
  const [period, setPeriod] = useState("monthly");

  const loadBudgets = async () => {
    const data = await getBudgetsForPeriod(db, period);
    console.log(data,"hello data")
    setBudgets(data);
  };

  useEffect(() => {
    loadBudgets();
  }, [period,isFocused]);

  const renderItem = ({ item }) => {
    const status = getBudgetStatus(item.spent, item.budget_amount);
    const percent = Math.min(
      Math.round((item.spent / item.budget_amount) * 100),
      100
    );

    return (
      <Pressable
        onPress={() => router.push(`/budgeting/${item.uuid}`)}
      >
        <Card>
          <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <BodyText style={{ fontWeight: "700", fontSize: 16 }}>
            {item.category_name}
          </BodyText>

          <BodyText style={{ fontSize: 12, color: "#777" }}>
            {percent}%
          </BodyText>
        </View>

        {/* Amounts */}
        <BodyText style={{ marginBottom: 10, color: "#555" }}>
          {item.spent} / {item.budget_amount}
        </BodyText>

        {/* Progress Bar */}
        <View
          style={{
            height: 10,
            backgroundColor: "#EEE",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${Math.min(percent, 100)}%`,
              backgroundColor:
                percent < 70
                  ? "#2E8B8B"
                  : percent < 90
                  ? "#F4B400"
                  : "#E53935",
              borderRadius: 8,
            }}
          />
        </View>

        {/* Status */}
        <BodyText
          style={{
            fontSize: 12,
            fontWeight: "600",
            color:
              percent < 70
                ? "#2E8B8B"
                : percent < 90
                ? "#F4B400"
                : "#E53935",
          }}
        >
          {status.toUpperCase()}
        </BodyText>
        </Card>
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
        onPress={() => router.push(`/budgetings/add?period=${period}`)}
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
