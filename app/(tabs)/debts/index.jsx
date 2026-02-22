import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { BodyText, Card, SecondaryText } from "../../../src/components/ThemeProvider/components";
import { useSQLiteContext } from "expo-sqlite";
import { dateFormat } from "../../../utils/dateFormat";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles"
import { getAllDebts, getDebtSummaryStats } from "../../../src/db/debtsDb";
import { AddButton } from "../../../src/components/common/AddButton";
import TimeFilters from "../../../src/components/transactions/TimeFilters";

export default function DebtsListScreen() {
  const isFocused = useIsFocused()
  const db = useSQLiteContext()
  const router = useRouter()
  const { globalStyles } =   useThemeStyles()

  const [debts,setDebts] = useState([])
  const [isLoading,setIsLoading] = useState(true)

  const [stats, setStats] = useState({
    total_balance:0,
    total_unpaid:0,
    total_paid:0,
  });
  const [period,setPeriod] = useState("30 days")

  const onPeriodChange = (value) => {
    setPeriod(value)
  }

  let fetchDebts = async() => {
      setIsLoading(true)
      let debts = await getAllDebts(db,period)
      setDebts(debts)
      setIsLoading(false)
  }

  let fetchDebtsStats = async () => {
    let stats = await getDebtSummaryStats(db,period)
    setStats(stats)
  }

  useEffect(() => {
      fetchDebts()
      fetchDebtsStats()
  },[isFocused, period])

  const renderItem = ({ item }) => {
    const isOwed = item.type === "owed";

    return (
      <Card>
        <Pressable onPress={() => router.push(`/debts/${item.uuid}`)}>
          <View style={styles.row}>
            <BodyText style={styles.title}>{item.title}</BodyText>
            <Text
              style={[
                styles.amount,
                isOwed ? styles.owed : styles.owing,
              ]}
            >
              {isOwed ? "+" : "-"} KES {item.amount}
            </Text>
          </View>
          <SecondaryText style={styles.counterparty}>
            {item.counterparty_name} ·{" "}
            {item.counterparty_type === "company" ? "🏢" : "👤"}
          </SecondaryText>
          <View style={styles.row}>
            <Text style={styles.dueDate}>
              Due: {dateFormat(item.due_date)}
            </Text>

            <Text
              style={[
                styles.status,
                item.is_paid ? styles.paid : styles.unpaid,
              ]}
            >
              {item.is_paid ? "Paid" : "Unpaid"}
            </Text>
          </View>
        </Pressable>
      </Card>
    );
  };

  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>Debts</BodyText>

        <FlatList
          data={debts}
          keyExtractor={(item) => item.uuid}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListHeaderComponent={
            <ListHeader
              stats={stats} 
              onPeriodChange={onPeriodChange}  
              globalStyles={globalStyles} 
              selectedPeriod={period}
            />
          }
        />
      
      <AddButton 
        primaryAction={{route:"/debts/add",label:"Add Debt"}}
      />

    </View>
  );
}

const ListHeader = ({ stats, onPeriodChange, globalStyles, selectedPeriod }) => {

  const format = (n) => Number(n || 0).toLocaleString();

  return (
    <View style={styles.container}>
      
      <TimeFilters
        onPeriodChange={onPeriodChange}
        selectedPeriod={selectedPeriod}
      />

      <Card style={styles.balanceCard}>
        <SecondaryText style={styles.balanceLabel}>
          Total Debt Balance
        </SecondaryText>

        <BodyText
          style={[
            styles.balanceAmount,
            { color: stats.total_balance > 0 ? "#FF6B6B" : "#2E8B8B" },
          ]}
        >
          KES {format(stats.total_balance)}
        </BodyText>

        <SecondaryText style={styles.subInfo}>
          {stats.total_debts} debts tracked
        </SecondaryText>
      </Card>


      <View style={styles.row}>
        
        <Card style={styles.statCard}>
          <SecondaryText style={styles.statLabel}>
            Remaining
          </SecondaryText>

          <BodyText style={[styles.statValue, styles.negative]}>
            KES {format(stats.total_unpaid)}
          </BodyText>
        </Card>

        <Card style={styles.statCard}>
          <SecondaryText style={styles.statLabel}>
            Paid
          </SecondaryText>

          <BodyText style={[styles.statValue, styles.positive]}>
            KES {format(stats.total_paid)}
          </BodyText>
        </Card>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  owed: {
    color: "#2E8B8B",
  },
  owing: {
    color: "#FF6B6B",
  },
  counterparty: {
    marginTop: 6,
    fontSize:12,
  },
  dueDate: {
    marginTop: 8,
    color: "#999",
    fontSize: 12,
  },
  status: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  paid: {
    color: "#2E8B8B",
  },
  unpaid: {
    color: "#FF6B6B",
  },
  container: {
    gap: 14,
    marginBottom: 10,
  },

  balanceCard: {
    padding: 22,
    borderRadius: 20,
    alignItems: "center",
  },

  balanceLabel: {
    opacity: 0.7,
    marginBottom: 6,
  },

  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },

  subInfo: {
    fontSize: 12,
    opacity: 0.6,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
  },

  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 6,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },

  positive: {
    color: "#2E8B8B",
  },

  negative: {
    color: "#FF6B6B",
  },

  viewStatsBtn: {
    alignSelf: "center",
    marginTop: 6,
  },

  viewStatsText: {
    color: "#2E8B8B",
    fontWeight: "600",
  },
});