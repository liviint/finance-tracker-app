import {  useState , useEffect} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";
import { SecondaryText , BodyText} from "../../../src/components/ThemeProvider/components";
import { syncManager } from "../../../utils/syncManager";
import { AddButton } from "../../../src/components/common/AddButton";

export default function CategoriesListScreen({ navigation }) {
  const db = useSQLiteContext();
  const router = useRouter()
  const {globalStyles} = useThemeStyles()
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const isFocused = useIsFocused()

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

  useEffect(() => {
    loadCategories();
  }, [isFocused]);

  useEffect(() => {
    const unsub = syncManager.on("transactions_updated", async () => {
      loadCategories();
    });
    return unsub;
  }, []);

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
      onPress={() => router.push(`/categories/${item.uuid}/edit`, { categoryId: item.id })}
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

      <BodyText >{item.name}</BodyText>
    </TouchableOpacity>
  );

  const Section = ({ title, data }) => (
    <View style={{ marginBottom: 24 }}>
      <SecondaryText
        style={{...globalStyles.subTitle,textAlign:'left'}}
      >
        {title}
      </SecondaryText>

      {data.length === 0 ? (
        <Text style={{ color: "#888" }}>No categories</Text>
        ) : (
        data.map((item) => (
        <View key={item.uuid}>{renderCategory({ item })}</View>
        ))
      )}
    </View>
  );

  return (
    <>
      <ScrollView style={globalStyles.container}>

        <BodyText style={globalStyles.title}>
          My Categories
        </BodyText>

        <Section title="Income" data={incomeCategories} />
        <Section title="Expenses" data={expenseCategories} />

      </ScrollView>
      <AddButton 
          primaryAction={{route:`/categories/add`,label:"Add Category"}}
        />
    </>
  );
}
