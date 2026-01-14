import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import { BodyText } from "../../../../src/components/ThemeProvider/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCategories, upsertCategory } from "../../../../src/db/transactionsDb";
import uuid from 'react-native-uuid';

const COLORS = [
  "#FF6B6B",
  "#F06595",
  "#845EC2",
  "#4D96FF",
  "#2E8B8B",
  "#6BCB77",
  "#FFD93D",
  "#FF9F45",
  "#A0A0A0",
];


export default function AddEditCategoryScreen({ route, navigation }) {
  const router = useRouter()
  const {globalStyles} = useThemeStyles()
  const db = useSQLiteContext();
  const {id:categoryUuid} = useLocalSearchParams()
  let initialForm = {
    name:"",
    type:"expense",
    color:COLORS[0],
    icon:"🛒",
    uuid:"",
  }
  const [form,setForm] = useState(initialForm)

  const handleFormChange = (key,value) => {
    setForm(prev => ({
      ...prev,
      [key]:value
    }))
  }

  useEffect(() => {
    if (!categoryUuid) return;
    let fetchCategory = async() => {
      let category = getCategories(db,categoryUuid)
      setForm(category)
    }
    fetchCategory()
  }, [categoryUuid]);

  const saveCategory = async () => {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Category name is required");
      return;
    }
    try {
      const cateUuid = form.uuid || uuid.v4();
      await upsertCategory(db,{...form,uuid:cateUuid})
      router.back();
      setForm(initialForm)
    } catch (error) {
      console.log(error,"hello error")
    }
  };

  return (
    <View style={globalStyles.container}>

      <BodyText style={globalStyles.title}>
        {categoryUuid ? "Edit Category" : "Add Category"}
      </BodyText>

      <Text style={{ marginBottom: 4 }}>Name</Text>
      <TextInput
        value={form.name}
        onChangeText={(value) => handleFormChange("name",value)}
        placeholder="e.g. Food"
        style={{
          borderWidth: 1,
          borderColor: "#DDD",
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
        }}
      />

      {/* Type (only when adding) */}
      {!categoryUuid && (
        <>
          <Text style={{ marginBottom: 8 }}>Type</Text>
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            {["expense", "income"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={(value) => handleFormChange("type",value)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor:
                    form.type === t ? "#2E8B8B" : "#EEE",
                  marginRight: t === "expense" ? 8 : 0,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: form.type === t ? "#FFF" : "#333",
                    fontWeight: "600",
                  }}
                >
                  {t === "expense" ? "Expense" : "Income"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Icon picker */}
      <Text style={{ marginBottom: 8 }}>Icon</Text>
      <TextInput
        value={form.icon}
        onChangeText={(text) => {
          handleFormChange("icon",text.slice(0, 2))
        }}
        placeholder="e.g. 🍔"
        style={{
          borderWidth: 1,
          borderColor: "#DDD",
          borderRadius: 10,
          padding: 12,
          fontSize: 18,
          marginBottom: 16,
        }}
        maxLength={2}
      />

      <Text style={{ marginVertical: 8 }}>Color</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {COLORS.map((c) => {
          const isSelected = form.color === c;

          return (
            <TouchableOpacity
              key={c}
              onPress={() => handleFormChange("color",c)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: c,
                margin: 8,
                borderWidth: isSelected ? 3 : 1,
                borderColor: isSelected ? "#333" : "#DDD",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSelected && (
                <Text style={{ color: "#FFF", fontWeight: "700" }}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Save button */}
      <TouchableOpacity
        onPress={saveCategory}
        style={{
          backgroundColor: "#2E8B8B",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 32,
        }}
      >
        <Text style={{ color: "#FFF", fontWeight: "600" }}>
          Save Category
        </Text>
      </TouchableOpacity>
    </View>
  );
}
