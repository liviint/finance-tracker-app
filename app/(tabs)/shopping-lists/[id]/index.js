import  { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Card, BodyText, Input, FormLabel, SecondaryText  } from "@/src/components/ThemeProvider/components";
import { useLocalSearchParams } from "expo-router";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";

const ShoppingListDetailsPage = ({ route, navigation }) => {
    const {globalStyles} = useThemeStyles()
    const { id:uuid} = useLocalSearchParams()
    let name = "hd"

  // Static data for testing
  const [items, setItems] = useState([
    { uuid: "item1", name: "Milk", quantity: 2, estimated_price: 120, is_completed: false },
    { uuid: "item2", name: "Bread", quantity: 1, estimated_price: 80, is_completed: true },
    { uuid: "item3", name: "Eggs", quantity: 12, estimated_price: 350, is_completed: false },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  const toggleCompleted = (itemUuid) => {
    setItems((prev) =>
      prev.map((item) =>
        item.uuid === itemUuid ? { ...item, is_completed: !item.is_completed } : item
      )
    );
  };

  const addItem = () => {
    if (!newItemName.trim()) {
      Alert.alert("Validation", "Please enter an item name.");
      return;
    }

    const newItem = {
      uuid: Date.now().toString(),
      name: newItemName,
      quantity: 1,
      estimated_price: parseFloat(newItemPrice) || 0,
      is_completed: false,
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.estimated_price || 0), 0);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => toggleCompleted(item.uuid)}>
      <Card style={[styles.itemCard, item.is_completed && styles.completedItem]}>
        <BodyText style={styles.itemName}>
          {item.name} {item.quantity > 1 ? `x${item.quantity}` : ""}
        </BodyText>
        <SecondaryText >KSh {item.estimated_price}</SecondaryText>
        {item.is_completed && <Text style={styles.completedLabel}>✓ Completed</Text>}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>{name}</BodyText>

      <Card style={styles.addCard}>
        <View style={globalStyles.formGroup}>
            <FormLabel>Item name</FormLabel>
            <Input
                style={styles.input}
                placeholder="i.e Vegetables"
                value={newItemName}
                onChangeText={setNewItemName}
            />
        </View>
        
        <View style={globalStyles.formGroup}>
            <FormLabel>Item name</FormLabel>
            <Input
                style={[styles.input, styles.priceInput]}
                placeholder="i.e 500"
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                keyboardType="numeric"
        />
        </View>

        <TouchableOpacity style={globalStyles.primaryBtn} onPress={addItem}>
            <Text style={globalStyles.primaryBtnText}>
                {uuid ? "Update Item" : "+ Add Item"}
            </Text>
        </TouchableOpacity>
        
      </Card>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}
        ListEmptyComponent={<Text style={styles.emptyText}>No items yet</Text>}
      />

      <View style={styles.totalContainer}>
        <BodyText style={styles.totalText}>Total: KSh {totalPrice}</BodyText>
      </View>
    </View>
  );
};

export default ShoppingListDetailsPage;

const styles = StyleSheet.create({
  
  addCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  priceInput: {
    width: "50%",
  },
  addButton: {
    marginTop: 8,
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  itemCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  completedItem: {
    backgroundColor: "#E0F7E0",
  },
  
  
  completedLabel: {
    color: "#28A745",
    fontWeight: "700",
    marginLeft: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },
  totalContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "700",
  },
});