import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Card, BodyText } from "@/src/components/ThemeProvider/components";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import { AddButton } from "../../../src/components/common/AddButton";
import { useRouter } from "expo-router";

const ShoppingListsPage = ({ navigation }) => {
    const {globalStyles} = useThemeStyles()
    const router = useRouter()
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
      onPress={() => router.push(`/shopping-lists/${item.uuid}`)}
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
    <View style={globalStyles.container}>

        <View style={styles.headerRow}>
            <BodyText style={globalStyles.title}>
                My shopping lists
            </BodyText>
        </View>

      <FlatList
        data={lists}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No shopping lists yet. Tap + to add one!</Text>
        }
      />
        <AddButton 
        primaryAction={{route:"/shopping-lists/add",label:"Add Transaction"}}
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
});