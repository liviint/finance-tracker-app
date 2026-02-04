import { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import {
    BodyText,
    FormLabel,
    Input,
    Card,
    SecondaryText,
} from "../ThemeProvider/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import uuid from "react-native-uuid";

import {
    upsertBudget,
    getBudgetByUUID,
} from "../../db/budgetingDb";
import { normalizeStartDate } from "../../helpers";
import CategoriesPicker from "../common/CategoriesPicker";
import { SwitchField } from "../common/SwitchField";

export default function AddEditBudget() {
    const router = useRouter();
    const db = useSQLiteContext();
    const { globalStyles } = useThemeStyles();
    const { id: budgetUUID} = useLocalSearchParams();

    const initialForm = {
        category_uuid: "",
        amount: "",
        date: new Date(),
        uuid: "",
        recurring:false,
    };

    const [form, setForm] = useState(initialForm);

    const handleFormChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };
    const handleCategoryChange = (selected) => {
        setForm((prev) => ({ ...prev, category_uuid: selected.uuid, category:selected.name, type:selected.type }))
    } 

    useEffect(() => {
        if (!budgetUUID) return;

        const loadBudget = async () => {
        const budget = await getBudgetByUUID(db, budgetUUID);

        setForm({
            uuid: budget.uuid,
            category_uuid: budget.category_uuid,
            amount: String(budget.budget_amount),
            date: new Date(budget.start_date),
            recurring:budget.recurring === 1,
        });
        };

        loadBudget();
    }, [budgetUUID]);

    const saveBudget = async () => {
        if (!form.category_uuid) {
            Alert.alert("Validation", "Please select a category");
            return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            Alert.alert("Validation", "Amount must be greater than zero");
            return;
        }

        try {
            const budgetUuid = form.uuid || uuid.v4();
            const startDate = normalizeStartDate(form.date);

            await upsertBudget({
                db,
                uuid: budgetUuid,
                categoryUUID: form.category_uuid,
                amount: Number(form.amount),
                startDate,
                recurring:form.recurring,
            });

            router.back();
            setForm(initialForm);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Failed to save budget");
        }
    };

    return (
        <ScrollView style={globalStyles.container}>
        <BodyText style={globalStyles.title}>
            {budgetUUID ? "Edit Budget" : "Add Budget"}
        </BodyText>

        <Card>

            <CategoriesPicker 
                form={form}
                handleCategoryChange={handleCategoryChange}
            />

        
            <View style={globalStyles.formGroup}>
                <FormLabel>Amount</FormLabel>
                <Input
                    value={form.amount}
                    keyboardType="numeric"
                    onChangeText={(v) => handleFormChange("amount", v)}
                    placeholder="e.g. 5000"
                />
            </View>

            <View style={globalStyles.formGroup}>
                <SwitchField 
                    label="Recurring"
                    value={form.recurring}
                    onChange={val => handleFormChange("recurring", val)}
                />
                <SecondaryText style={{ color: "#777" }}>
                        Repeat this budget every month automatically
                    </SecondaryText>
            </View>

            <TouchableOpacity
            onPress={saveBudget}
            style={globalStyles.primaryBtn}
            >
            <Text style={globalStyles.primaryBtnText}>
                {budgetUUID ? "Update Budget" : "Save Budget"}
            </Text>
            </TouchableOpacity>
        </Card>
        </ScrollView>
    );
}
