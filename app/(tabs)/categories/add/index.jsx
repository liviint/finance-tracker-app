import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const COLORS = [
  "#FF6B6B",
  "#4D96FF",
  "#6BCB77",
  "#FFD93D",
  "#845EC2",
  "#2E8B8B",
];

const ICONS = ["🍔", "🚗", "🏠", "🛒", "🎓", "💼", "🎁", "💊", "📁"];

export default function AddEditCategoryScreen({ route, navigation }) {
  const db = useSQLiteContext();
  const categoryId = route?.params?.categoryId;

  const isEdit = Boolean(categoryId);

  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (!isEdit) return;

    const loadCategory = async () => {
      const rows = await db.getAllAsync(
        `SELECT * FROM finance_categories WHERE id = ?`,
        [categoryId]
      );

      if (rows.length) {
        const cat = rows[0];
        setName(cat.name);
        setType(cat.type);
        setColor(cat.color);
        setIcon(cat.icon);
      }
    };

    loadCategory();
  }, [categoryId]);

  const saveCategory = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Category name is required");
      return;
    }

    if (isEdit) {
      await db.runAsync(
        `UPDATE finance_categories
         SET name = ?, color = ?, icon = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [name.trim(), color, icon, categoryId]
      );
    } else {
      await db.runAsync(
        `INSERT INTO finance_categories
         (uuid, name, type, color, icon)
         VALUES (?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), name.trim(), type, color, icon]
      );
    }

    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
        {isEdit ? "Edit Category" : "Add Category"}
      </Text>

      {/* Name */}
      <Text style={{ marginBottom: 4 }}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
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
      {!isEdit && (
        <>
          <Text style={{ marginBottom: 8 }}>Type</Text>
          <View style={{ flexDirection: "row", marginBottom: 16 }}>
            {["expense", "income"].map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor:
                    type === t ? "#2E8B8B" : "#EEE",
                  marginRight: t === "expense" ? 8 : 0,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: type === t ? "#FFF" : "#333",
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
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {ICONS.map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setIcon(i)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              margin: 6,
              backgroundColor: icon === i ? "#EEE" : "transparent",
            }}
          >
            <Text style={{ fontSize: 18 }}>{i}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color picker */}
      <Text style={{ marginVertical: 8 }}>Color</Text>
      <View style={{ flexDirection: "row" }}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setColor(c)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: c,
              marginRight: 12,
              borderWidth: color === c ? 3 : 0,
              borderColor: "#000",
            }}
          />
        ))}
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
