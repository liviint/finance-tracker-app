import { View, Alert, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Input, FormLabel, BodyText } from "../ThemeProvider/components";
import { upsertSavingsGoal, getSavingsGoal } from "../../../src/db/savingsDb";
import { useThemeStyles } from "../../hooks/useThemeStyles";

export default function AddEditSavings() {
    const {globalStyles} = useThemeStyles()
    const db = useSQLiteContext();
    const router = useRouter();
    const { uuid } = useLocalSearchParams();

    const [form, setForm] = useState({
        name: "",
        target_amount: "",
        color: "#2E8B8B",
        icon: "💰",
    });

    useEffect(() => {
        if (uuid) {
        getSavingsGoal(db, uuid).then(setForm);
        }
    }, [uuid]);

    const handleSave = async () => {
        if (!form.name || !form.target_amount) {
        Alert.alert("Validation", "Name and target amount are required");
        return;
        }

        await upsertSavingsGoal(db, {
        ...form,
        target_amount: Number(form.target_amount),
        uuid,
        });

        router.back();
    };

    return (
        <View style={globalStyles.container}>
            <View style={globalStyles.formGroup}>
                <FormLabel>Name</FormLabel>
                <Input value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
            </View>

            <View style={globalStyles.formGroup}>
                <FormLabel>Target Amount</FormLabel>
                <Input
                    keyboardType="numeric"
                    value={String(form.target_amount)}
                    onChangeText={(v) => setForm({ ...form, target_amount: v })}
                />
            </View>

            <TouchableOpacity onPress={handleSave} style={globalStyles.primaryBtn}>
                <BodyText style={globalStyles.primaryBtnText}>
                Save
                </BodyText>
            </TouchableOpacity>
        </View>
    );
}
