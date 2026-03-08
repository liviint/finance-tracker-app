import { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { BodyText, Card, SecondaryText } from "../../../src/components/ThemeProvider/components";

const getPastSixMonths = () => {
  const months = [];
  const now = new Date();

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

    months.push({
      label: d.toLocaleString("default", { month: "short" }),
      value: d,
    });
  }

  return months;
};



const BudgetListHeader = ({
  stats = {},
  selectedMonth,
  onMonthChange,
}) => {

    const [isPrevDisabled, setIsPrevDisabled] = useState(selectedMonth <= sixMonthsAgo - 1)
    const [isNextDisabled, setIsNextDisabled] = useState(selectedMonth >= today)

  const {
    total_budgeted = 0,
    total_spent = 0,
    total_remaining = 0,
    overspent_count = 0,
  } = stats;

  const monthLabel = selectedMonth?.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();

const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(today.getMonth() - 6); 

const goPrevMonth = () => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() - 1);

    setIsPrevDisabled(d < sixMonthsAgo)
    if (d < sixMonthsAgo) return;
    setIsNextDisabled(false)

    onMonthChange(d);
};

const goNextMonth = () => {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() + 1);

    setIsNextDisabled(d > today)
    if (d > today) return;
    setIsPrevDisabled(false)

    onMonthChange(d);
};




  return (
    <View style={styles.container}>

      
      <View style={styles.monthNav}>
        <TouchableOpacity disabled={isPrevDisabled} onPress={goPrevMonth}>
            <BodyText style={[styles.arrow, isPrevDisabled && {opacity:0.3}]}>◀</BodyText>
        </TouchableOpacity>

        <BodyText style={styles.monthText}>
            {monthLabel}
        </BodyText>

        <TouchableOpacity disabled={isNextDisabled} onPress={goNextMonth}>
            <BodyText style={[styles.arrow, isNextDisabled && {opacity:0.3}]}>▶</BodyText>
        </TouchableOpacity>
      </View>

      {overspent_count > 0 && 
        <Card style={styles.mainCard}>
          <SecondaryText style={styles.warning}>
            ⚠ You’re over budget in {overspent_count} {overspent_count > 1 ? "categories" : "category"}.
          </SecondaryText>
        </Card>
      }

      <View style={styles.row}>
        <Card style={styles.card}>
          <SecondaryText style={styles.label}>Budgeted</SecondaryText>
          <BodyText style={styles.value}>
            KES {total_budgeted?.toLocaleString()}
          </BodyText>
        </Card>

        <Card style={styles.card}>
          <SecondaryText style={styles.label}>Spent</SecondaryText>
          <BodyText style={[styles.value, { color: "#FF6B6B" }]}>
            KES {total_spent?.toLocaleString()}
          </BodyText>
        </Card>
      </View>

      <View style={styles.row}>
        <Card style={styles.card}>
          <SecondaryText style={styles.label}>Remaining</SecondaryText>
          <BodyText style={[styles.value, { color: "#2E8B8B" }]}>
            KES {total_remaining?.toLocaleString()}
          </BodyText>
        </Card>
      </View>

    </View>
  );
};

export default BudgetListHeader;

const styles = StyleSheet.create({
    container: {
        gap: 14,
        marginBottom: 10,
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
    monthNav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    monthText: {
        fontSize: 16,
        fontWeight: "700",
    },

    arrow: {
        fontSize: 18,
        paddingHorizontal: 10,
    },
});
