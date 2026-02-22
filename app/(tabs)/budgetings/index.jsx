import { View, FlatList, Pressable , Text, StyleSheet} from "react-native";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import {
  ensureRecurringBudgetsForMonth,
  getMonthlyBudgets,
  getMonthlyBudgetStats,
} from "../../../src/db/budgetingDb";
import { BodyText, Card, SecondaryText } from "../../../src/components/ThemeProvider/components";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";
import { syncManager } from "../../../utils/syncManager";
import { AddButton } from "../../../src/components/common/AddButton";
import EmptyState from "../../../src/components/common/EmptyState";

export default function BudgetsListScreen() {
  const router = useRouter();
  const isFocused = useIsFocused()
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();

  const [budgets, setBudgets] = useState([]);
  const [isLoading,setIsLoading] = useState(true)

  const [stats, setStats] = useState();

  const loadBudgets = async () => {
    setIsLoading(true)
    await ensureRecurringBudgetsForMonth(db)
    const data = await getMonthlyBudgets(db);
    setBudgets(data);
    setIsLoading(false)
  };
  
  const fetchBudgetStats = async () => {
    let stats = await getMonthlyBudgetStats(db)
    setStats(stats)
  }

  useEffect(() => {
    loadBudgets();
    fetchBudgetStats()
  }, [isFocused]);

  useEffect(() => {
    const unsub = syncManager.on("budgets_updated", async () => {
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

      {
        !isLoading && budgets.length === 0 ? 
        <EmptyState 
          title="No monthly budgets yet"
          description="Create budgets to plan your spending and stay within your limits."
        /> : 
      
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.uuid}
          renderItem={renderItem}
          ListHeaderComponent={
            <BudgetListHeader 
              stats={stats} 

            />
          }
        />
      }
      
      <AddButton
          primaryAction={{route:`/budgetings/add`,label:"Add Budget"}}
          secondaryActions={[{route:"/categories/add/modal",label:"Add Category"}]}
      />
    </View>
  );
}

const BudgetListHeader = ({
  stats = {},
}) => {
  const {
    total_budgeted = 0,
    total_spent = 0,
    total_remaining = 0,
    overspent_count = 0,
  } = stats;

  return (
    <View style={styles.container}>

      {overspent_count > 0 && 
        <Card style={styles.mainCard}>
            <SecondaryText style={styles.warning}>
              {overspent_count} category over budget
            </SecondaryText>
        </Card>
      }

      <View style={styles.row}>
        <Card style={styles.card}>
          <SecondaryText style={styles.label}>Budgeted</SecondaryText>
          <BodyText style={styles.value}>
            KES {total_budgeted.toLocaleString()}
          </BodyText>
        </Card>

        <Card style={styles.card}>
          <SecondaryText style={styles.label}>Spent</SecondaryText>
          <BodyText style={[styles.value, { color: "#FF6B6B" }]}>
            KES {total_spent.toLocaleString()}
          </BodyText>
        </Card>
      </View>

      <View style={styles.row}>
        <Card style={styles.card}>
          <SecondaryText style={styles.label}>Remaining</SecondaryText>
          <BodyText style={[styles.value, { color: "#2E8B8B" }]}>
            KES {total_remaining.toLocaleString()}
          </BodyText>
        </Card>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
    marginBottom: 10,
  },

  monthLabel: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.7,
  },

  mainCard: {
    padding: 22,
    borderRadius: 22,
    alignItems: "center",
  },

  mainLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },

  mainValue: {
    fontSize: 34,
    fontWeight: "700",
  },

  warning: {
    marginTop: 8,
    fontSize: 12,
    color: "#FF6B6B",
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  card: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
  },

  label: {
    fontSize: 12,
    opacity: 0.6,
  },

  value: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
});
