import { View, Pressable, StyleSheet, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useIsFocused } from "@react-navigation/native";
import { getBudgetByUUID, deleteBudget, getBudgetStatus } from "../../../../src/db/budgetingDb";
import DeleteButton from "../../../../src/components/common/DeleteButton";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import {
  BodyText,
  SecondaryText,
  Card,
} from "../../../../src/components/ThemeProvider/components";

export default function BudgetDetailsScreen() {
  const { id: uuid } = useLocalSearchParams();
  const router = useRouter();
  const db = useSQLiteContext();
  const { globalStyles } = useThemeStyles();
  const isFocused = useIsFocused()
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    const loadBudget = async () => {
      const data = await getBudgetByUUID(db, uuid);
      console.log(data,"hello data")
      setBudget(data);
    }
    if(isFocused) loadBudget()
  }, [uuid, isFocused]);

  const handleDelete = async () => {
    await deleteBudget(db, uuid);
    router.replace("/budgetings");
  };

  if (!budget) return null;

  const spent = budget.spent || 0;
  const total = budget.budget_amount;

  const percent = Math.min(
    Math.round((spent / total) * 100),
    100
  );

  const status = getBudgetStatus(spent, total);

  const statusColor =
    percent < 70
      ? "#2E8B8B"
      : percent < 90
      ? "#F4B400"
      : "#E53935";

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <BodyText style={globalStyles.title}>Budget Details</BodyText>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{budget.period}</Text>
        </View>
      </View>

      <Card>
        <SecondaryText style={styles.label}>Budget Amount</SecondaryText>
        <BodyText style={styles.amount}>
          KES {Number(total).toLocaleString()}
        </BodyText>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.metaLabel}>Start Date</Text>
          <BodyText style={styles.metaValue}>
            {new Date(budget.start_date).toDateString()}
          </BodyText>
        </View>
      </Card>

      <Card>
        <SecondaryText style={styles.label}>Spending Status</SecondaryText>

        <View style={styles.spendingRow}>
          <BodyText style={{ fontWeight: "600" }}>
            KES {spent.toLocaleString()}
          </BodyText>
          <SecondaryText>
            of KES {total.toLocaleString()}
          </SecondaryText>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${percent}%`,
                backgroundColor: statusColor,
              },
            ]}
          />
        </View>

        <View style={styles.statusRow}>
          <BodyText
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: statusColor,
            }}
          >
            {status.toUpperCase()}
          </BodyText>

          <SecondaryText style={{ fontSize: 12 }}>
            {percent}%
          </SecondaryText>
        </View>
      </Card>

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push(`/budgetings/${uuid}/edit`)}
          style={{ ...globalStyles.secondaryBtn, flex: 1 }}
        >
          <BodyText style={globalStyles.secondaryBtnText}>
            Edit Budget
          </BodyText>
        </Pressable>

        <DeleteButton
          handleOk={handleDelete}
          item="budget"
          cusomStyles={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F2F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E8B8B",
    textTransform: "capitalize",
  },

  label: {
    fontSize: 13,
    color: "#777",
  },

  amount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E8B8B",
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  metaLabel: {
    fontSize: 14,
    color: "#777",
  },

  metaValue: {
    fontSize: 14,
    fontWeight: "600",
  },

  spendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  progressBarBg: {
    height: 10,
    backgroundColor: "#EEE",
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 8,
  },

  progressBarFill: {
    height: "100%",
    borderRadius: 8,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 10,
    marginTop: 16,
  },
});
