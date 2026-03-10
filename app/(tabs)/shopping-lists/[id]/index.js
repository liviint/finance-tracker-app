import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert, Modal } from "react-native";
import { Card, BodyText, Input, FormLabel, SecondaryText } from "@/src/components/ThemeProvider/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import { getShoppingListByUuid, getShoppingItemsByListUuid, upsertShoppingItem } from "../../../../src/db/shoppingListDb";
import { useSQLiteContext } from "expo-sqlite";
import { useIsFocused } from "@react-navigation/native";
import { AddButton } from "../../../../src/components/common/AddButton";

const ShoppingListDetailsPage = () => {
  const { globalStyles } = useThemeStyles();
  const { id: uuid } = useLocalSearchParams();
  const db = useSQLiteContext()
  const router = useRouter();
  const isFocused = useIsFocused();

  const [list, setList] = useState({ name: "" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [reloadItems,setReloadItems] = useState(0)
  const [showForm, setShowForm] = useState(false);

  // Load shopping list and items
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!uuid) return;
        const listData = await getShoppingListByUuid(db,uuid);
        console.log(listData,"hello list data")
        setList(listData);
      } catch (error) {
        console.error("Error loading list items:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [uuid,isFocused]);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!uuid) return;
        const itemData = await getShoppingItemsByListUuid(db,uuid);
        console.log(itemData,"hello item data")
        setItems(itemData || []);
      } catch (error) {
        console.error("Error loading list items:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [uuid,reloadItems,isFocused]);

  const toggleCompleted = async (itemUuid) => {
    const updatedItems = items.map((item) =>
      item.uuid === itemUuid ? { ...item, is_completed: item.is_completed ? 0 : 1 } : item
    );
    setItems(updatedItems);

    const updatedItem = updatedItems.find((i) => i.uuid === itemUuid);
    await upsertShoppingItem(db,{ ...updatedItem, list_uuid: uuid });
  };

  const addItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert("Validation", "Please enter an item name.");
      return;
    }

    const newItem = {
      uuid: "",
      list_uuid: uuid,
      name: newItemName,
      quantity: 1,
      estimated_price: parseFloat(newItemPrice) || 0,
      is_completed: 0,
    };

    try {
      await upsertShoppingItem(db,newItem);
      setNewItemName("");
      setNewItemPrice("");
      setReloadItems(prev => prev + 1)
    } catch (error) {
      console.error("Error adding item:", error);
      Alert.alert("Error", "Unable to add item.");
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.estimated_price || 0), 0);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => toggleCompleted(item.uuid)}>
      <Card style={[styles.itemCard, item.is_completed ? styles.completedItem : null]}>
        <BodyText style={item.is_completed ? {...styles.itemCompleted} : {}}>
          {item.name} {item.quantity > 1 ? `x${item.quantity}` : ""}
        </BodyText>
        <SecondaryText>KSh {item.estimated_price}</SecondaryText>
        {item.is_completed ? <Text style={styles.completedLabel}>✓ Completed</Text> : null}
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <Text style={{ margin: 20 }}>Loading...</Text>;

  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>{list.name || "Shopping List"}</BodyText>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}
        ListEmptyComponent={<Text style={styles.emptyText}>No items yet</Text>}
      />

      <View style={styles.totalContainer}>
        <BodyText style={styles.totalText}>Total: KSh {totalPrice}</BodyText>
      </View>

      <AddButton action={() => setShowForm(true)} />

            <Modal
        visible={showForm}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>

            <BodyText style={styles.modalTitle}>Add Item</BodyText>

            <View style={globalStyles.formGroup}>
              <FormLabel>Item name</FormLabel>
              <Input
                placeholder="i.e Vegetables"
                value={newItemName}
                onChangeText={setNewItemName}
              />
            </View>

            <View style={globalStyles.formGroup}>
              <FormLabel>Estimated price</FormLabel>
              <Input
                placeholder="i.e 500"
                value={newItemPrice}
                onChangeText={setNewItemPrice}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={globalStyles.primaryBtn}
              onPress={async () => {
                await addItem();
                setShowForm(false);
              }}
            >
              <Text style={globalStyles.primaryBtnText}>Save Item</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

          </Card>
        </View>
      </Modal>

    </View>
  );
};

export default ShoppingListDetailsPage;

const styles = StyleSheet.create({
  addCard: { padding: 16, borderRadius: 16, marginBottom: 16 },
  priceInput: { width: "50%" },
  itemCard: { padding: 16, marginBottom: 12, borderRadius: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemCompleted:{color:"black"},
  completedItem: { backgroundColor: "#E0F7E0" },
  completedLabel: { color: "#28A745", fontWeight: "700", marginLeft: 8 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
  totalContainer: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderColor: "#eee", 
    alignItems: "center" 
  },
  totalText: { fontSize: 16, fontWeight: "700" },
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},

modalCard: {
  width: "90%",
  padding: 20,
  borderRadius: 16,
},

modalTitle: {
  fontSize: 18,
  fontWeight: "700",
  marginBottom: 10,
},

cancelBtn: {
  marginTop: 10,
  alignItems: "center",
},

cancelText: {
  color: "#999",
  fontWeight: "600",
},
});