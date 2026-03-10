import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import { AddButton } from "@/src/components/common/AddButton";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { getAllShoppingLists } from "../../../src/db/shoppingListDb";
import { useIsFocused } from "@react-navigation/native";

const ShoppingListsPage = () => {
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();
  const router = useRouter();
  const isFocused = useIsFocused()

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLists = async () => {
      try {
        const data = await getAllShoppingLists(db);
        setLists(data);
      } catch (error) {
        console.error("Error fetching shopping lists:", error);
      }
      setLoading(false);
    };
    loadLists();
  }, [db,isFocused]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/shopping-lists/${item.uuid}`)}
    >
      <Card style={styles.card}>
        <BodyText style={styles.title}>{item.name}</BodyText>
        <BodyText style={styles.note}>{item.note || "No description"}</BodyText>
        <BodyText style={styles.helperText}>
          Items: {item.item_count || 0}, Completed: {item.completed_count || 0}
        </BodyText>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <View style={styles.headerRow}>
        <BodyText style={globalStyles.title}>
          My Shopping Lists
        </BodyText>
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
});