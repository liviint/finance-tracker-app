import { View, Alert, TouchableOpacity, ScrollView } from "react-native";
import uuid from "react-native-uuid";
import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card, Input, FormLabel, BodyText } from "../ThemeProvider/components";
import { upsertSavingsGoal, getSavingsGoal, addToSavings } from "../../../src/db/savingsDb";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { COLORS } from "../../../utils/constants";

export default function AddEditSavings() {
    const { globalStyles } = useThemeStyles();
    const db = useSQLiteContext();
    const router = useRouter();
    const { id: savingsUuid } = useLocalSearchParams();

    const [form, setForm] = useState({
        name: "",
        target_amount: "",
        current_amount: "",
        color: COLORS[4],
        icon: "💰",
    });

    useEffect(() => {
        if (!savingsUuid) return;

        const loadGoal = async () => {
        const goal = await getSavingsGoal(db, savingsUuid);
        if (!goal) return;

        setForm({
            name: goal.name,
            target_amount: String(goal.target_amount),
            current_amount: String(goal.current_amount ?? 0),
            color: goal.color || "#2E8B8B",
            icon: goal.icon || "💰",
        });
        };

        loadGoal();
    }, [savingsUuid]);

    const handleFormChange = (key,value) => {
        setForm(prev => ({
            ...prev,
            [key]:value
        }))
    }

    const handleSave = async () => {
        if (!form.name.trim()) {
        Alert.alert("Validation", "Please enter a savings goal name.");
        return;
        }

        const target = Number(form.target_amount);
        const current = Number(form.current_amount || 0);

        if (isNaN(target) || target <= 0) {
        Alert.alert("Validation", "Target amount must be greater than 0.");
        return;
        }

        if (isNaN(current) || current < 0) {
        Alert.alert("Validation", "Current amount cannot be negative.");
        return;
        }

        if (current > target) {
        Alert.alert(
            "Validation",
            "Current amount cannot be greater than target amount."
        );
        return;
        }

        let goalUuid = savingsUuid || uuid.v4()

        await upsertSavingsGoal(db, {
            uuid: goalUuid,
            name: form.name.trim(),
            target_amount: target,
            color: form.color,
            icon: form.icon,
        });

        if (!savingsUuid && current > 0) {
            await addToSavings({db, savingsUuid:goalUuid,amount: Number(current)});
        }

        router.back();
    };

    return (
        <ScrollView style={globalStyles.container}>
        <BodyText style={globalStyles.title}>
            {savingsUuid ? "Edit Savings Goal" : "Add Savings Goal"}
        </BodyText>

        <Card>
            {/* Name */}
            <View style={globalStyles.formGroup}>
            <FormLabel>Name</FormLabel>
            <Input
                placeholder="e.g. Emergency Fund"
                value={form.name}
                onChangeText={(value) => handleFormChange("name",value)}
            />
            </View>

            {/* Target */}
            <View style={globalStyles.formGroup}>
            <FormLabel>Target Amount</FormLabel>
            <Input
                placeholder="0"
                keyboardType="numeric"
                value={form.target_amount}
                onChangeText={(value) =>
                    handleFormChange("target_amount",value.replace(/[^0-9.]/g, ""))
                }
            />
            </View>

            {!savingsUuid && <View style={globalStyles.formGroup}>
            <FormLabel>Current Amount</FormLabel>
            <Input
                placeholder="0"
                keyboardType="numeric"
                value={form.current_amount}
                onChangeText={(value) =>
                    handleFormChange("current_amount",value.replace(/[^0-9.]/g, ""))
                }
            />
            </View>}

            {/* Icon */}
            <View style={globalStyles.formGroup}>
            <FormLabel>Icon (Emoji)</FormLabel>
            <Input
                placeholder="💰"
                value={form.icon}
                onChangeText={(value) => handleFormChange("icon",value)}
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
                            <BodyText style={{ color: "#FFF", fontWeight: "700" }}>✓</BodyText>
                        )}
                        </TouchableOpacity>
                    );
                    })}
                </View>
            </View>
            

            <TouchableOpacity
            onPress={handleSave}
            style={globalStyles.primaryBtn}
            >
            <BodyText style={globalStyles.primaryBtnText}>
                {savingsUuid ? "Update" : "Save"}
            </BodyText>
            </TouchableOpacity>
        </Card>
        </ScrollView>
    );
}
