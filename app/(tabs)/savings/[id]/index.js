import { View, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams } from "expo-router";
import { BodyText, Card, Input } from "@/src/components/ThemeProvider/components";
import { getSavingsGoal, addToSavings } from "@/src/db/savingsDb";

export default function SavingsDetail() {
  const db = useSQLiteContext();
  const { uuid } = useLocalSearchParams();
  const [goal, setGoal] = useState(null);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    getSavingsGoal(db, uuid).then(setGoal);
  }, []);

  if (!goal) return null;

  return (
    <View style={{ padding: 16 }}>
      <Card>
        <BodyText style={{ fontSize: 20, fontWeight: "700" }}>
          {goal.icon} {goal.name}
        </BodyText>

        <BodyText>
          {goal.current_amount} / {goal.target_amount}
        </BodyText>
      </Card>

      <Input
        placeholder="Add amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity
        onPress={async () => {
          await addToSavings(db, uuid, Number(amount));
          const updated = await getSavingsGoal(db, uuid);
          setGoal(updated);
          setAmount("");
        }}
      >
        <BodyText style={{ textAlign: "center", marginTop: 16 }}>
          Add to savings
        </BodyText>
      </TouchableOpacity>
    </View>
  );
}
