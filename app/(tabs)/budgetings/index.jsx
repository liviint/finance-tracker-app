import { View, FlatList, Pressable , Text} from "react-native";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  ensureRecurringBudgetsForMonth,
  getMonthlyBudgets,
} from "../../../src/db/budgetingDb";
import { BodyText, Card } from "../../../src/components/ThemeProvider/components";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";
import { syncManager } from "../../../utils/syncManager";
import { AddButton } from "../../../src/components/common/AddButton";

export default function BudgetsListScreen() {
  const router = useRouter();
  const isFocused = useIsFocused()
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();

  const [budgets, setBudgets] = useState([]);

  const loadBudgets = async () => {
    await ensureRecurringBudgetsForMonth(db)
    const data = await getMonthlyBudgets(db);
    setBudgets(data);
  };

  useEffect(() => {
    loadBudgets();
  }, [isFocused]);

  useEffect(() => {
    const unsub = syncManager.on("transactions_updated", async () => {
      loadBudgets();
    });
    return unsub;
  }, []);

  const renderItem = ({ item }) => {
    const percent = Math.min(
      Math.round((item.spent / item.budget_amount) * 100),
      100
    );

    const progressColor =
      percent < 70
        ? "#2E8B8B"
        : percent < 90
        ? "#F4B400"
        : "#E53935";

    return (
      <Pressable onPress={() => router.push(`/budgetings/${item.uuid}`)}>
        <Card style={{ padding: 16 }}>
          
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
      
            <View style={{ flex: 1 }}>
              <BodyText style={{ fontWeight: "700", fontSize: 16 }}>
                {item.category_name}
              </BodyText>

              {item.recurring === 1 && (
                <View
                  style={{
                    marginTop: 6,
                    alignSelf: "flex-start",
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 999,
                    backgroundColor: "#E6F2F2",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: "#2E8B8B",
                    }}
                  >
                    Recurring
                  </Text>
                </View>
              )}
            </View>

            <BodyText style={{ fontSize: 12, color: "#777" }}>
              {percent}%
            </BodyText>
          </View>

          <BodyText style={{ fontSize: 13, color: "#555", marginBottom: 10 }}>
            {item.spent} spent • {item.budget_amount} limit
          </BodyText>

          <View
            style={{
              height: 8,
              backgroundColor: "#EEE",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${percent}%`,
                backgroundColor: progressColor,
                borderRadius: 999,
              }}
            />
          </View>
        </Card>
      </Pressable>
    );
};


  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>
        My Monthly budegt
      </BodyText>
      
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
        ListEmptyComponent={
          <BodyText style={{ textAlign: "center", marginTop: 32 }}>
            No monthly budgets yet
          </BodyText>
        }
      />
      <AddButton
          primaryAction={{route:`/budgetings/add`,label:"Add Budget"}}/>
    </View>
  );
}
