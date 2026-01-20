import { View, TouchableOpacity, Pressable, } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BodyText, Card, Input } from "@/src/components/ThemeProvider/components";
import {
  getSavingsGoal,
  addToSavings,
  deleteSavingsGoal,
} from "@/src/db/savingsDb";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import Delete from "../../../../src/components/common/DeleteButton"

export default function SavingsDetail() {
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();
  const router = useRouter();
  const isFocused = useIsFocused()
  const { id: savingsUuid } = useLocalSearchParams();

  const [goal, setGoal] = useState(null);
  const [amount, setAmount] = useState("");

  const loadGoal = async () => {
    const data = await getSavingsGoal(db, savingsUuid);
    setGoal(data);
  };
  const handleDelete = async() => {
        try {
            await deleteSavingsGoal(db, savingsUuid);
            router.replace("/savings");
        } catch (error) {
            console.log(error,"hello error")
        }
    };

    const handleAddSavings = async() => {
        await addToSavings({db, savingsUuid,amount: Number(amount)});
        await loadGoal();
        setAmount("");
    }

  useEffect(() => {
    loadGoal();
  }, [isFocused]);

    if (!goal) return null;

    

  return (
    <View style={globalStyles.container}>
        <BodyText style={globalStyles.title}>
            Savings details
        </BodyText>
        <View style={{ flexDirection: "row",justifyContent:"center",alignItems:"center", gap: 16, marginBottom:16 }}>
                <Pressable
                    style={{...globalStyles.primaryBtn,paddingVertical: 8,
            paddingHorizontal: 16,}}
                    onPress={() =>
                    router.push(`/savings/${savingsUuid}/stats`)
                    }
                >
                    <BodyText style={globalStyles.primaryBtnText}>
                        Stats
                    </BodyText>
                </Pressable>

                <Pressable
                    style={{...globalStyles.secondaryBtn,paddingVertical: 8,
            paddingHorizontal: 16,}}
                    onPress={() =>
                    router.push(`/savings/${savingsUuid}/edit`)
                    }
                >
                    <BodyText style={globalStyles.secondaryBtnText}>
                        Edit
                    </BodyText>
                </Pressable>

                <Delete 
                    handleOk={handleDelete} 
                    item="savings goal"
                />
        </View>

        <Card style={{ marginBottom: 16 }}>
            <BodyText style={{ fontSize: 20, fontWeight: "700" }}>
            {goal.icon} {goal.name}
            </BodyText>

            <BodyText>
            {goal.total_saved} / {goal.target_amount}
            </BodyText>
        </Card>

        <Card>
            <Input
            placeholder="Add amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            />

            <TouchableOpacity
            onPress={handleAddSavings}
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
