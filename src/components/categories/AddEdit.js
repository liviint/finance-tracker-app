import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { BodyText, FormLabel, Input , PrimaryBtn} from "../ThemeProvider/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCategories, upsertCategory } from "../../db/transactionsDb";
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


export default function AddEdit() {
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
      let category = await getCategories(db,categoryUuid)
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

        <View style={globalStyles.formGroup}>
            <FormLabel >Name</FormLabel>
            <Input
                value={form.name}
                onChangeText={(value) => handleFormChange("name",value)}
                placeholder="e.g. Food"
            />
        </View>

        <View style={globalStyles.formGroup}>
        <>
            <FormLabel >Type</FormLabel>
            <View style={{ flexDirection: "row", marginBottom: 16 }}>
                {["expense", "income"].map((t) => (
                <TouchableOpacity
                    key={t}
                    onPress={() => handleFormChange("type",t)}
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
                    {t === "expense" ? "expense" : "income"}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>
        </>
      
        </View>

        <View style={globalStyles.formGroup}>
            <FormLabel >Icon</FormLabel>
            <Input
                value={form.icon}
                onChangeText={(text) => {
                handleFormChange("icon",text.slice(0, 2))
                }}
                placeholder="e.g. 🍔"
                maxLength={2}
            />
        </View>

        <View style={globalStyles.formGroup}>
            <FormLabel >Color</FormLabel>
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
        </View>

        <TouchableOpacity
            onPress={saveCategory}
            style={globalStyles.primaryBtn}
        >
            <Text style={globalStyles.primaryBtnText}>
                {categoryUuid ? "Update Category": "Save Category"}
            </Text>
        </TouchableOpacity>
    </View>
  );
}
