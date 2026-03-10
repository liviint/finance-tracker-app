import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";

const ShoppingListsPage = ({ navigation }) => {
  // Static default data for testing
  const [lists, setLists] = useState([
    {
      uuid: "1",
      name: "Groceries",
      note: "Weekly food and essentials",
      itemCount: 5,
      completedCount: 2,
    },
    {
      uuid: "2",
      name: "Electronics",
      note: "Gadgets and accessories",
      itemCount: 3,
      completedCount: 0,
    },
    {
      uuid: "3",
      name: "Stationery",
      note: "Office and school supplies",
      itemCount: 4,
      completedCount: 1,
    },
  ]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ShoppingListDetails", { uuid: item.uuid })}
    >
      <Card style={styles.card}>
        <BodyText style={styles.title}>{item.name}</BodyText>
        <BodyText style={styles.note}>{item.note || "No description"}</BodyText>
        <BodyText style={styles.helperText}>
          Items: {item.itemCount}, Completed: {item.completedCount}
        </BodyText>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No shopping lists yet. Tap + to add one!</Text>
        }
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddShoppingList")}
      >
        <Text style={styles.addButtonText}>＋ Add List</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ShoppingListsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
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
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#FF6B6B",
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});