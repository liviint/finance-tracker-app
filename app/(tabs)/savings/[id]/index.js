import { View, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { BodyText, Card, Input } from "@/src/components/ThemeProvider/components";
import { getSavingsGoal, addToSavings } from "@/src/db/savingsDb";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";

export default function SavingsDetail() {
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();
  const { id: savingsUuid } = useLocalSearchParams();

  const [goal, setGoal] = useState(null);
  const [amount, setAmount] = useState("");

  const loadGoal = async () => {
    const data = await getSavingsGoal(db, savingsUuid);
    setGoal(data);
  };

  useEffect(() => {
    loadGoal();
  }, []);

  const handleAdd = async () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount");
      return;
    }

    await addToSavings(db, savingsUuid, value);
    await loadGoal();
    setAmount("");
  };

  if (!goal) return null;

  const progress = Math.min(
    goal.current_amount / goal.target_amount,
    1
  );

  return (
    <View style={globalStyles.container}>
      
      <BodyText style={globalStyles.title}>
        Savings details
      </BodyText>

     
      <Card style={{ marginBottom: 16 }}>
        <BodyText style={{ fontSize: 20, fontWeight: "700", marginBottom: 4 }}>
          {goal.icon} {goal.name}
        </BodyText>

        <BodyText style={{ marginBottom: 8 }}>
          {goal.current_amount.toLocaleString()} /{" "}
          {goal.target_amount.toLocaleString()}
        </BodyText>

        
        <View
          style={{
            height: 8,
            backgroundColor: "#EEE",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: goal.color || "#2E8B8B",
            }}
          />
        </View>
      </Card>

     
      <Card>
        <Input
          placeholder="Amount to add"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TouchableOpacity
          onPress={handleAdd}
          style={{ ...globalStyles.primaryBtn, marginTop: 16 }}
        >
          <BodyText style={globalStyles.primaryBtnText}>
            Add to savings
          </BodyText>
        </TouchableOpacity>
      </Card>
    </View>
  );
}
