import { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert, Modal } from "react-native";
import { Card, BodyText, Input, FormLabel, SecondaryText } from "@/src/components/ThemeProvider/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import { getShoppingListByUuid, getShoppingItemsByListUuid, upsertShoppingItem, getShoppingListStats, deleteShoppingItem, } from "../../../../src/db/shoppingListDb";
import { useSQLiteContext } from "expo-sqlite";
import { useIsFocused } from "@react-navigation/native";
import { AddButton } from "../../../../src/components/common/AddButton";
import { MaterialIcons } from "@expo/vector-icons";

const ShoppingListDetailsPage = () => {
  const { globalStyles } = useThemeStyles();
  const { id: uuid } = useLocalSearchParams();
  const db = useSQLiteContext()
  const router = useRouter();
  const isFocused = useIsFocused();

  const [list, setList] = useState({ name: "" });
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [reloadItems,setReloadItems] = useState(0)
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showActions, setShowActions] = useState(false);

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
        setItems(itemData || []);
      } catch (error) {
        console.error("Error loading list items:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [uuid,reloadItems,isFocused]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (!uuid) return;
        const statsData = await getShoppingListStats(db, uuid);
        console.log(statsData,"hello stats data")
        setStats(statsData);
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };

    loadStats();
  }, [uuid, reloadItems, isFocused]);




  const toggleCompleted = async (itemUuid) => {
    const updatedItems = items.map((item) =>
      item.uuid === itemUuid ? { ...item, is_completed: item.is_completed ? 0 : 1 } : item
    );
    setItems(updatedItems);

    const updatedItem = updatedItems.find((i) => i.uuid === itemUuid);
    await upsertShoppingItem(db,{ ...updatedItem, list_uuid: uuid });
    setReloadItems(prev => prev + 1)
  };

  const addEditItem = async () => {
  if (!newItemName.trim()) {
    Alert.alert("Validation", "Please enter an item name.");
    return;
  }

  const item = {
    uuid: selectedItem?.uuid || "",
    list_uuid: uuid,
    name: newItemName,
    quantity: 1,
    estimated_price: parseFloat(newItemPrice) || 0,
    is_completed: selectedItem?.is_completed || 0,
  };

  try {
    await upsertShoppingItem(db, item);

    setNewItemName("");
    setNewItemPrice("");
    setSelectedItem(null);

    setReloadItems((prev) => prev + 1);
  } catch (error) {
    console.error("Error saving item:", error);
  }
};

  const deleteItem = async (itemUuid) => {
    try {
      await deleteShoppingItem(db, itemUuid);
      setReloadItems((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDeleteItem = async () => {
  if (!selectedItem) return;

  Alert.alert(
    "Confirm Delete",
    `Are you sure you want to delete "${selectedItem.name}"?`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteItem(selectedItem.uuid); 
            setShowActions(false);
            setSelectedItem(null);
          } catch (error) {
            console.error("Error deleting item:", error);
            Alert.alert("Error", "Unable to delete item.");
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  const openActions = (item) => {
    setSelectedItem(item);
    setShowActions(true);
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.itemCard, item.is_completed && styles.completedItem]}>
  
  <TouchableOpacity
    style={{ flex: 1 }}
    onPress={() => toggleCompleted(item.uuid)}
  >
    <BodyText style={item.is_completed && styles.itemCompleted}>
      {item.name} {item.quantity > 1 ? `x${item.quantity}` : ""}
    </BodyText>

    <SecondaryText>KSh {item.estimated_price}</SecondaryText>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.actionsBtn}
    onPress={() => openActions(item)}
  >
    <MaterialIcons name="more-vert" size={22} color="#666" />
  </TouchableOpacity>

</Card>
  );


  if (loading) return <Text style={{ margin: 20 }}>Loading...</Text>;

  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>{list.name || "Shopping List"}</BodyText>

      <Card style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <BodyText style={styles.progressText}>
            {stats.completedCount} / {stats.itemCount} items completed
          </BodyText>

          <SecondaryText>
            KSh {stats.spentAmount} / {stats.totalEstimated}
          </SecondaryText>
        </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${stats.progress * 100}%` }
          ]}
        />
      </View>
</Card>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}
        ListEmptyComponent={<Text style={styles.emptyText}>No items yet</Text>}
      />

      <AddButton action={() => setShowForm(true)} />

            <Modal
        visible={Boolean(showForm)}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            
            <BodyText style={styles.modalTitle}>{selectedItem ? "Edit Item" : "Add Item"}</BodyText>

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
                await addEditItem();
                setShowForm(false);
              }}
            >
              <Text style={globalStyles.primaryBtnText}>
                {selectedItem ? "Update Item" : "Save Item"}
              </Text>
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

      <Modal
  visible={showActions}
  transparent
  animationType="fade"
>
  <TouchableOpacity
    style={styles.actionsOverlay}
    onPress={() => setShowActions(false)}
  >
    <View style={styles.actionsPopup}>

      <TouchableOpacity
        style={styles.actionItem}
        onPress={() => {
          console.log(selectedItem,"hello selected item")
          setShowActions(false);
          setNewItemName(selectedItem.name)
          setNewItemPrice(String(selectedItem.estimated_price))
          setShowForm(true)          
        }}
      >
        <MaterialIcons name="edit" size={20} color="#333" />
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionItem}
        onPress={() => {
          setShowActions(false);
          handleDeleteItem()
        }}
      >
        <MaterialIcons name="delete" size={20} color="#FF6B6B" />
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>

    </View>
  </TouchableOpacity>
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
statsCard: {
  padding: 18,
  borderRadius: 16,
  marginBottom: 16
},

statsHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 10
},

progressText: {
  fontWeight: "700",
  fontSize: 16
},

progressBarContainer: {
  height: 10,
  backgroundColor: "#eee",
  borderRadius: 8,
  overflow: "hidden"
},

progressBarFill: {
  height: "100%",
  backgroundColor: "#FF6B6B"
},
// actionsBtn: {
//   position: "absolute",
//   right: 10,
//   top: 10,
//   padding: 6
// },

itemContent: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
},

actionsOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.2)",
  justifyContent: "center",
  alignItems: "center"
},

actionsPopup: {
  backgroundColor: "white",
  borderRadius: 12,
  paddingVertical: 10,
  width: 180
},

actionItem: {
  flexDirection: "row",
  alignItems: "center",
  padding: 12,
  gap: 10
},

actionText: {
  fontSize: 15
},
});