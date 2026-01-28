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
import { syncManager } from "../../../utils/syncManager";
import { getAllDebts } from "../../../src/db/debtsDb";

export default function DebtsListScreen() {
  const isFocused = useIsFocused()
  const db = useSQLiteContext()
  const router = useRouter()
  const { globalStyles } =   useThemeStyles()
  const [debts,setDebts] = useState([])

  let fetchTransactions = async() => {
      let debts = await getAllDebts(db)
      setDebts(debts)
  }

  useEffect(() => {
      fetchTransactions()
  },[isFocused])

  const renderItem = ({ item }) => {
    const isOwed = item.type === "owed";

    return (
      <Card>
        <View style={styles.row}>
          <BodyText style={styles.title}>{item.title}</BodyText>
          <Text
            style={[
              styles.amount,
              isOwed ? styles.owed : styles.owing,
            ]}
          >
            {isOwed ? "-" : "+"} KES {item.amount}
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
      />

      <Pressable
        onPress={() => router.push("/debts/add")}
        style={globalStyles.addButton}
      >
        <Text style={globalStyles.addText}>＋</Text>
      </Pressable>
    </View>
  );
}

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
    color: "#FF6B6B",
  },
  owing: {
    color: "#2E8B8B",
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
});