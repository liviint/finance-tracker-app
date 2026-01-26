import { View, FlatList, TouchableOpacity } from "react-native";
import {  useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { Card, BodyText } from "../../../src/components/ThemeProvider/components";
import { getSavingsGoals } from "../../../src/db/savingsDb";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";
import { syncManager } from "../../../utils/syncManager";

export default function SavingsList() {
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();
  const router = useRouter();
  const isFocused = useIsFocused()
  
  const [goals, setGoals] = useState([]);

  const loadGoals = async () => {
    const data = await getSavingsGoals(db);
    setGoals(data || []);
  };

  useEffect(() => {
      loadGoals();
  },[isFocused])
  
  useEffect(() => {
    const unsub = syncManager.on("transactions_updated", async () => {
      loadGoals();
    });
    return unsub;
  }, []);

  const renderItem = ({ item }) => {
    const progress = Math.min(
      item.total_saved / item.target_amount,
      1
    );

    return (
      <TouchableOpacity
        onPress={() => router.push(`/savings/${item.uuid}`)}
        activeOpacity={0.8}
      >
        <Card style={{ marginBottom: 12 }}>
          <BodyText style={{ fontWeight: "700", marginBottom: 4 }}>
            {item.icon} {item.name}
          </BodyText>

          <BodyText style={{ opacity: 0.8 }}>
            {item?.total_saved?.toLocaleString() || 0} /{" "}
            {item?.target_amount?.toLocaleString() || 0}
          </BodyText>

          {/* Progress bar */}
          <View
            style={{
              height: 8,
              backgroundColor: "#EEE",
              borderRadius: 4,
              marginTop: 8,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                backgroundColor: item.color || "#2E8B8B",
              }}
            />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>My Savings</BodyText>

      <TouchableOpacity
        onPress={() => router.push("/savings/add")}
        style={{ ...globalStyles.primaryBtn, marginBottom: 16 }}
      >
        <BodyText style={globalStyles.primaryBtnText}>
          + Add savings goal
        </BodyText>
      </TouchableOpacity>

      {goals.length === 0 ? (
        <Card>
          <BodyText style={{ textAlign: "center", opacity: 0.7 }}>
            No savings goals yet.
          </BodyText>
          <BodyText style={{ textAlign: "center", marginTop: 8 }}>
            Start by creating your first goal 🎯
          </BodyText>
        </Card>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.uuid}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
