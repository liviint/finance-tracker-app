import { View, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { Card, BodyText } from "../../../src/components/ThemeProvider/components";
import { getSavingsGoals } from "../../../src/db/savingsDb";
import {useThemeStyles} from "../../../src/hooks/useThemeStyles"

export default function SavingsList() {
    const {globalStyles} = useThemeStyles()
    const db = useSQLiteContext();
    const router = useRouter();
    const [goals, setGoals] = useState([]);

    useEffect(() => {
        getSavingsGoals(db).then(setGoals);
    }, []);

    return (
        <View style={globalStyles.container}>

            <TouchableOpacity
                onPress={() => router.push("/savings/add")}
                style={globalStyles.primaryBtn}
            >
                <BodyText style={globalStyles.primaryBtnText}>
                + Add savings goal
                </BodyText>
            </TouchableOpacity>

            <FlatList
                data={goals}
                keyExtractor={(item) => item.uuid}
                renderItem={({ item }) => {
                const progress = Math.min(
                    item.current_amount / item.target_amount,
                    1
                );

                return (
                    <TouchableOpacity
                    onPress={() => router.push(`/savings/${item.uuid}`)}
                    >
                    <Card style={{ marginBottom: 12 }}>
                        <BodyText style={{ fontWeight: "700" }}>
                        {item.icon} {item.name}
                        </BodyText>

                        <BodyText>
                        {item.current_amount} / {item.target_amount}
                        </BodyText>

                        <View
                        style={{
                            height: 8,
                            backgroundColor: "#EEE",
                            borderRadius: 4,
                            marginTop: 8,
                        }}
                        >
                        <View
                            style={{
                            width: `${progress * 100}%`,
                            height: "100%",
                            backgroundColor: item.color || "#2E8B8B",
                            borderRadius: 4,
                            }}
                        />
                        </View>
                    </Card>
                    </TouchableOpacity>
                );
                }}
            />
        </View>
    );
}
