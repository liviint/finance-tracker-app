import { useEffect, useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

import {
  CustomButton,
  LoadingSpinner,
} from "../ThemeProvider/components";

import {
  getTransactionTemplateByUuid,
  deleteTransactionTemplate,
} from "../../db/transactionTemplatesDb";

export default function TransactionTemplateDetailsScreen() {
  const db = useSQLiteContext();
  const route = useRoute();
  const navigation = useNavigation();

  const { uuid } = route.params;

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ============================================================
     ✅ Load Template Details
  ============================================================ */
  const loadTemplate = async () => {
    setLoading(true);

    const result = await getTransactionTemplateByUuid(db, uuid);

    setTemplate(result);
    setLoading(false);
  };

  useEffect(() => {
    loadTemplate();
  }, []);

  /* ============================================================
     ✅ Delete Template
  ============================================================ */
  const handleDelete = () => {
    Alert.alert(
      "Delete Template?",
      "This template will be removed from your list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTransactionTemplate(db, uuid);
            Alert.alert("Deleted ✅", "Template removed successfully.");
            navigation.goBack();
          },
        },
      ]
    );
  };

  /* ============================================================
     ✅ Edit Template
  ============================================================ */
  const handleEdit = () => {
    navigation.navigate("EditTransactionTemplate", { uuid });
  };

  /* ============================================================
     ✅ Loading State
  ============================================================ */
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!template) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Template not found.
        </Text>
      </View>
    );
  }

  /* ============================================================
     ✅ UI
  ============================================================ */
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>{template.title}</Text>

      {/* Amount */}
      <Text
        style={[
          styles.amount,
          template.type === "income"
            ? styles.income
            : styles.expense,
        ]}
      >
        {template.type === "income" ? "+" : "-"} KES{" "}
        {template.amount || "—"}
      </Text>

      {/* Details Card */}
      <View style={styles.card}>
        <DetailRow label="Type" value={template.type} />
        <DetailRow
          label="Category"
          value={template.category || "Uncategorized"}
        />
        <DetailRow
          label="Payee"
          value={template.payee || "—"}
        />
        <DetailRow
          label="Note"
          value={template.note || "—"}
        />
        <DetailRow
          label="Created"
          value={template.created_at}
        />
      </View>

      {/* Actions */}
      <View style={{ marginTop: 20 }}>
        <CustomButton title="✏️ Edit Template" onPress={handleEdit} />
        <View style={{ height: 12 }} />
        <CustomButton
          title="🗑 Delete Template"
          variant="danger"
          onPress={handleDelete}
        />
      </View>
    </View>
  );
}

/* ============================================================
   ✅ Small Detail Row Component
============================================================ */
function DetailRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/* ============================================================
   ✅ Styles (ZeniaMoney Theme)
============================================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F7",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },

  amount: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },

  income: {
    color: "#2E8B8B",
  },

  expense: {
    color: "#FF6B6B",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },

  value: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    maxWidth: "60%",
    textAlign: "right",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
  },
});
