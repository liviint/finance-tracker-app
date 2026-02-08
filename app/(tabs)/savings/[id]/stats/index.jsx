import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { Card, BodyText, SecondaryText } from "../../../../../src/components/ThemeProvider/components";
import { getSavingsGoalStats } from "../../../../../src/db/savingsDb";
import SavingsLineChart from "../../../../../src/components/savings/SavingsLineChart";
import { useThemeStyles } from "../../../../../src/hooks/useThemeStyles";

export default function SavingsGoalStats() {
    const { id:uuid } = useLocalSearchParams();
    const db = useSQLiteContext();
    const router = useRouter();
    const {globalStyles} = useThemeStyles()

    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!uuid) return;

        const loadStats = async () => {
            try {
                const data = await getSavingsGoalStats(db, uuid);
                setStats(data);
            } catch (error) {
                console.log(error,"hello error")
            }
        };

        loadStats();
    }, [uuid]);

    if (!stats) return <View style={globalStyles.container}></View>

    const {
        goal,
        totalSaved,
        target,
        remaining,
        progress,
        depositsCount,
        lastDeposit,
        chartData,
    } = stats;

    return (
        <ScrollView style={globalStyles.container}>
            <View style={styles.header}>
                <Text style={styles.icon}>{goal.icon}</Text>
                <BodyText style={globalStyles.title}>{goal.name}</BodyText>
                <BodyText style={styles.target}>
                    Target: KES {target.toLocaleString()}
                </BodyText>
            </View>

        

        <View style={styles.statsRow}>
            <StatCard label="Saved" value={`KES ${totalSaved}`} />
            <StatCard label="Deposits" value={depositsCount} />
        </View>

        <View style={styles.statsRow}>
            <StatCard
            label="Remaining"
            value={`KES ${remaining}`}
            />
            <StatCard
            label="Last deposit"
            value={lastDeposit ? lastDeposit.slice(0, 10) : "—"}
            />
        </View>

            <Card style={styles.card}>
                <BodyText style={styles.sectionTitle}>Growth</BodyText>
                <SavingsLineChart
                    data={chartData}
                    color={goal.color}
                />
            </Card>
        <View style={{marginBottom:24}}>
            <Pressable
                style={{...globalStyles.primaryBtn, backgroundColor: goal.color }}
                onPress={() => router.push(`/savings/${uuid}`)}
            >
                <Text style={globalStyles.primaryBtnText}>Add Savings</Text>
            </Pressable>
        </View>
        </ScrollView>
    );
}

const StatCard = ({ label, value }) => (
    <Card style={styles.statCard}>
        <BodyText style={styles.statValue}>{value}</BodyText>
        <SecondaryText style={styles.statLabel}>{label}</SecondaryText>
    </Card>
);

const styles = StyleSheet.create({
  
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  target: {
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
  },
  progressText: {
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: "#EEE",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  amount: {
    marginTop: 12,
    fontWeight: "600",
  },
  remaining: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 12,
  },
  chartPlaceholder: {
    textAlign: "center",
    color: "#999",
    paddingVertical: 24,
  },
});
