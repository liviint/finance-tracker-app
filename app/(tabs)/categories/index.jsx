import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useFocusEffect } from "expo-router";

export default function CategoriesListScreen({ navigation }) {
  const db = useSQLiteContext();

  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);

  const loadCategories = async () => {
    const income = await db.getAllAsync(
      `SELECT * FROM finance_categories
       WHERE type='income' AND deleted_at IS NULL
       ORDER BY name`
    );

    const expense = await db.getAllAsync(
      `SELECT * FROM finance_categories
       WHERE type='expense' AND deleted_at IS NULL
       ORDER BY name`
    );

    setIncomeCategories(income);
    setExpenseCategories(expense);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

  const deleteCategory = (category) => {
    Alert.alert(
      "Delete category",
      `Delete "${category.name}"? Transactions will remain.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await db.runAsync(
              `UPDATE finance_categories
               SET deleted_at = datetime('now')
               WHERE id = ?`,
              [category.id]
            );
            loadCategories();
          },
        },
      ]
    );
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("edit-category", { categoryId: item.id })
      }
      onLongPress={() => deleteCategory(item)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: item.color || "#EEE",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Text style={{ fontSize: 16 }}>{item.icon || "📁"}</Text>
      </View>

      <Text style={{ fontSize: 16 }}>{item.name}</Text>
    </TouchableOpacity>
  );

  const Section = ({ title, data }) => (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      {data.length === 0 ? (
        <Text style={{ color: "#888" }}>No categories</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategory}
        />
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Section title="Income" data={incomeCategories} />
      <Section title="Expenses" data={expenseCategories} />

      <TouchableOpacity
        onPress={() => navigation.navigate("add-category")}
        style={{
          backgroundColor: "#2E8B8B",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <Text style={{ color: "#FFF", fontWeight: "600" }}>
          Add Category
        </Text>
      </TouchableOpacity>
    </View>
  );
}
