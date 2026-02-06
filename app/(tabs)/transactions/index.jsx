import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { View, FlatList, StyleSheet, Pressable } from "react-native";
import { Card, BodyText, SecondaryText } from "../../../src/components/ThemeProvider/components";
import { AddButton } from "../../../src/components/common/AddButton";
import { useRouter } from "expo-router";
import { getTransactions, getTransactionStats } from "../../../src/db/transactionsDb";
import { useSQLiteContext } from "expo-sqlite";
import { dateFormat } from "../../../utils/dateFormat";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles"
import { syncManager } from "../../../utils/syncManager";

const TIME_FILTERS = [
  "7 days",
  "This Month",
  "30 days",
  "3 months",
  "6 months",
  "1 year",
];

export default function FinanceListPage() {
    const db = useSQLiteContext()
    const router = useRouter();
    const [transactions,setTransactions] = useState([])
    const isFocused = useIsFocused()
    const {globalStyles} = useThemeStyles()
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        balance: 0,
      });
    
      const [period,setPeriod] = useState("30 days")

      const onPeriodChange = (value) => {
        setPeriod(value)
      }
    
    let fetchTransactions = async() => {
        let transactions = await getTransactions(db)
        setTransactions(transactions)
    }
    const fetchStats = async () => {
      const summary = await getTransactionStats(db);
      setStats(summary);
    };

    useEffect(() => {
    if (isFocused) {
      fetchTransactions()
      fetchStats()
    }
    },[isFocused])

    useEffect(() => {
      const unsub = syncManager.on("transactions_updated", async () => {
        fetchTransactions()
        fetchStats()
      });
      return unsub;
    }, []);

  const renderItem = ({ item }) => (
    <Pressable onPress={() => router.push(`/transactions/${item.uuid}`)}>
        <Card >
            <View style={styles.row}>
                <View>
                  <BodyText style={styles.title}>{item.title}</BodyText>
                  
                  <SecondaryText style={styles.meta}>
                    {item.category} {" • "}
                    {dateFormat(item?.date)} {item.payee ? " • " : ""} 
                    {item.payee}
                  </SecondaryText>
                </View>
                <BodyText style={[styles.amount, item.type === "expense"  ? styles.expense : styles.income]}>
                  {item.type === "expense" ? "-" : "+"}KES {Math.abs(item.amount).toLocaleString()}
                </BodyText>
            </View>
        </Card>
    </Pressable>
  );

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={transactions}
        ListHeaderComponent={
          <ListHeader 
            stats={stats} 
            onPeriodChange={onPeriodChange}  
            globalStyles={globalStyles} 
          />
        }
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 96 }}
      />
      <AddButton 
          primaryAction={{route:"/transactions/add",label:"Add Transaction"}}
          secondaryActions={[
            {route:"/categories/add/modal",label:"Add Category"},
            {route:"/transactions-templates/add/",label:"Add Template"},
          ]}
        />
    </View>
  );
}

const ListHeader = ({ stats, onPeriodChange, globalStyles }) => {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  const handleSelectPeriod = (period) => {
    setSelectedPeriod(period);
    if (onPeriodChange) onPeriodChange(period);
  };
  return <>
    <View style={styles.headerRow}>
      <SecondaryText style={globalStyles.title}>
        My transactions
      </SecondaryText>
    </View>

    <Card style={styles.balanceCard}>
      <SecondaryText style={styles.balanceLabel}>
        Current Balance
      </SecondaryText>
      <BodyText
        style={[
          styles.balanceAmount,
          { color: stats.balance >= 0 ? "#2E8B8B" : "#FF6B6B" },
        ]}
      >
        KES {stats.balance.toLocaleString()}
      </BodyText>
    </Card>

    <View style={styles.statRow}>
      <Card style={styles.statCard}>
        <SecondaryText style={styles.statLabel}>Income</SecondaryText>
        <BodyText style={[styles.statAmount, styles.income]}>
          +KES {stats.income.toLocaleString()}
        </BodyText>
      </Card>

      <Card style={styles.statCard}>
        <SecondaryText style={styles.statLabel}>Expenses</SecondaryText>
        <BodyText style={[styles.statAmount, styles.expense]}>
          -KES {stats.expenses.toLocaleString()}
        </BodyText>
      </Card>
    </View>

    <View style={styles.viewStatsRow}>
      <Pressable onPress={() => router.push("/transactions/stats")}>
        <SecondaryText style={styles.viewStatsText}>
          View stats
        </SecondaryText>
      </Pressable>
    </View>

    <View style={styles.filterRow}>
        {TIME_FILTERS.map((period) => (
          <Pressable
            key={period}
            onPress={() => handleSelectPeriod(period)}
            style={[
              styles.filterChip,
              selectedPeriod === period && styles.filterChipActive,
            ]}
          >
            <BodyText
              style={[
                styles.filterText,
                selectedPeriod === period && { color: "#FFFFFF", fontWeight: "600" },
              ]}
            >
              {period}
            </BodyText>
          </Pressable>
        ))}
      </View>

  </>
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
  },
  subHeader: {
    fontSize: 14,
    marginTop: 2,
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  viewStatsRow: {
    alignItems: "flex-end",
    marginBottom: 12,
  },

  viewStatsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E8B8B",
  },

  balanceCard: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  statsText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E8B8B",
  },
  filterRow: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
  marginVertical: 12,
},

filterChip: {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 12,
  backgroundColor: "#F0F0F0",
},

filterChipActive: {
  backgroundColor: "#2E8B8B",
},

filterText: {
  fontSize: 12,
  color: "#333",
},

  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontWeight: "600",
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  income: {
    color: "#2E8B8B",
  },
  expense: {
    color: "#FF6B6B",
  },
});