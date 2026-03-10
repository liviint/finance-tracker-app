import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import { AddButton } from "@/src/components/common/AddButton";
import DeleteButton from "../../../src/components/common/DeleteButton"
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { getAllShoppingLists, deleteShoppingList } from "../../../src/db/shoppingListDb";
import { useIsFocused } from "@react-navigation/native";

const ShoppingListsPage = () => {
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();
  const router = useRouter();
  const isFocused = useIsFocused();

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLists = async () => {
    try {
      const data = await getAllShoppingLists(db);
      console.log(data,"hello data")
      setLists(data);
    } catch (error) {
      console.error("Error fetching shopping lists:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLists();
  }, [db, isFocused]);

  const handleDelete = async (uuid) => {
    await deleteShoppingList(db, uuid);
    loadLists();
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <TouchableOpacity
        onPress={() => router.push(`/shopping-lists/${item.uuid}`)}
      >
        <BodyText style={styles.title}>{item.name}</BodyText>
        <BodyText style={styles.note}>{item.note || "No description"}</BodyText>
        <BodyText style={styles.helperText}>
          Items: {item.item_count || 0}, Completed: {item.completed_count || 0}
        </BodyText>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={globalStyles.editBtn}
          onPress={() => router.push(`/shopping-lists/add?id=${item.uuid}`)}
        >
          <Text style={globalStyles.editBtnText}>Edit</Text>
        </TouchableOpacity>

        <DeleteButton 
          item="list"
          handleOk={() => handleDelete(item.uuid)}
        />

      </View>
    </Card>
  );

  return (
    <View style={globalStyles.container}>
      <View style={styles.headerRow}>
        <BodyText style={globalStyles.title}>My Shopping Lists</BodyText>
      </View>

      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "Loading..." : "No shopping lists yet. Tap + to add one!"}
          </Text>
        }
      />

      <AddButton 
        primaryAction={{ route: "/shopping-lists/add", label: "Add List" }}
      />
    </View>
  );
};

export default ShoppingListsPage;

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  note: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },
  headerRow: {
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap:10,
  },
  editBtn: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#2E8B8B",
    borderRadius: 8,
  },
  deleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
  },
});