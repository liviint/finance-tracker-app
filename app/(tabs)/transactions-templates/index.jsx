import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

export default function TransactionTemplatesListScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Templates
  const loadTemplates = async () => {
    setLoading(true);

    const result = await db.getAllAsync(`
      SELECT *
      FROM transaction_templates
      WHERE deleted_at IS NULL
      ORDER BY updated_at DESC
    `);

    setTemplates(result);
    setLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // ✅ Render Template Item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("TemplateDetails", { uuid: item.uuid })
      }
    >
      <View style={styles.row}>
        <Text style={styles.title}>{item.title}</Text>

        <Text
          style={[
            styles.amount,
            item.type === "income"
              ? styles.incomeAmount
              : styles.expenseAmount,
          ]}
        >
          {item.type === "income" ? "+" : "-"} KES {item.amount}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.category}>
          {item.category || "Uncategorized"}
        </Text>

        <Text style={styles.typeBadge}>
          {item.type.toUpperCase()}
        </Text>
      </View>

      {item.note ? (
        <Text style={styles.note} numberOfLines={1}>
          {item.note}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  // ✅ Empty State
  if (!loading && templates.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Templates Yet</Text>
        <Text style={styles.emptyText}>
          Create transaction templates to quickly reuse transactions.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={loadTemplates}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F7",
    padding: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
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

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  amount: {
    fontSize: 15,
    fontWeight: "700",
  },

  incomeAmount: {
    color: "#2E8B8B",
  },

  expenseAmount: {
    color: "#FF6B6B",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  category: {
    fontSize: 13,
    color: "#666",
  },

  typeBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#333",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: "hidden",
  },

  note: {
    marginTop: 6,
    fontSize: 12,
    color: "#888",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FAF9F7",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
