import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { Card, BodyText, Input, FormLabel } from "@/src/components/ThemeProvider/components";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getShoppingListByUuid, upsertShoppingList } from "../../db/shoppingListDb"; 
import { useSQLiteContext } from "expo-sqlite";

const AddShoppingListPage = () => {
  const { globalStyles } = useThemeStyles();
  const { id:uuid } = useLocalSearchParams();
  const router = useRouter();
  const db = useSQLiteContext()

  const initialForm = {
    name:"",
    note:"",
    uuid:uuid || "",
  }
  const [form,setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true);

  const handleFormChange = (name,value) => {
    setForm(prev => ({
        ...prev,
        [name]:value
    }))
  }

  // Load existing list if editing
  useEffect(() => {
    const loadList = async () => {
      if (uuid) {
        try {
          const list = await getShoppingListByUuid(db,uuid);
          if (list) setForm(list)
        } catch (error) {
          console.error("Error loading list:", error);
        }
      }
      setLoading(false);
    };
    loadList();
  }, [uuid]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Please enter a name for the shopping list.");
      return;
    }
    
    try {
      await upsertShoppingList(db,form); 
      router.push("/shopping-lists"); 
      setForm(initialForm)
    } catch (error) {
      console.error("Error saving list:", error);
      Alert.alert("Error", "Unable to save list.");
    }
  };

  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>
        {uuid ? "Edit Shopping List" : "Add Shopping List"}
      </BodyText>

      <Card style={styles.card}>
        <View style={globalStyles.formGroup}>
          <FormLabel style={styles.label}>List Name</FormLabel>
          <Input
            placeholder="Enter list name"
            value={form.name}
            onChangeText={(value) => handleFormChange("name",value)}
          />
        </View>

        <View style={globalStyles.formGroup}>
          <FormLabel style={styles.label}>Note (optional)</FormLabel>
          <Input
            placeholder="Enter a note"
            value={form.note}
            onChangeText={(value) => handleFormChange("note",value)}
            multiline
          />
        </View>

        <TouchableOpacity
          style={globalStyles.primaryBtn}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={globalStyles.primaryBtnText}>
            {uuid ? "Update List" : "+ Save List"}
          </Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
};

export default AddShoppingListPage;

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
  },
  label: {
    fontWeight: "600",
  },
});