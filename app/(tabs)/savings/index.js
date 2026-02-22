import { View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import {  useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { Card, BodyText, SecondaryText } from "../../../src/components/ThemeProvider/components";
import { getSavingsGoals, getSavingsStats } from "../../../src/db/savingsDb";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";
import { syncManager } from "../../../utils/syncManager";
import { AddButton } from "../../../src/components/common/AddButton";
import EmptyState from "../../../src/components/common/EmptyState";

export default function SavingsList() {
  const { globalStyles } = useThemeStyles();
  const db = useSQLiteContext();
  const router = useRouter();
  const isFocused = useIsFocused()
  
  const [goals, setGoals] = useState([]);

  const [stats, setStats] = useState();

  const loadGoals = async () => {
    const data = await getSavingsGoals(db);
    setGoals(data || []);
  };

  const getStats = async () => {
    let stats = await getSavingsStats(db)
    setStats(stats)
  }

  useEffect(() => {
      loadGoals();
      getStats()
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

        <Card style={styles.card}>
          <BodyText style={{ fontWeight: "700", marginBottom: 4 }}>
            {item.icon} {item.name}
          </BodyText>
                    <BodyText style={styles.progressText}>
                        {Math.round(progress * 100)}% completed
                    </BodyText>
        
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
        
            <BodyText style={styles.amount}>
                KES {item?.total_saved.toLocaleString()} saved
            </BodyText>
            <SecondaryText style={styles.remaining}>
                KES {(item?.target_amount - item?.total_saved).toLocaleString()} remaining
            </SecondaryText>
                </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={globalStyles.container}>
      <BodyText style={globalStyles.title}>My Savings</BodyText>

      {goals.length === 0 ? (
        <EmptyState 
          title="No savings goals yet."
          description="Create a savings goal to plan for the things that matter most."
        />
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.uuid}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <SavingsListHeader stats={stats} />
          }
        />
      )}
      <AddButton 
        primaryAction={{route:"/savings/add",label:"Add Saving"}}
      />
    </View>
  );
}

const SavingsListHeader = ({ stats = {} }) => {
  const {
    total_saved = 0,
    total_remaining = 0,
    total_target = 0,
    completed_goals = 0,
    overall_progress_percent = 0,
    total_goals = 0,
  } = stats;

  return (
    <View style={styles.container}>

      <View style={styles.row}>
        <Card style={styles.card}>
          <SecondaryText style={{...styles.label,textAlign:"center"}}>Target</SecondaryText>
          <BodyText style={{...styles.value,textAlign:"center"}}>
            KES {total_target.toLocaleString()}
          </BodyText>
        </Card>
      </View>

      <View style={styles.row}>
        <Card style={styles.card}>
          <SecondaryText style={styles.label}>Total Saved</SecondaryText>
          <BodyText style={[styles.value, { color: "#2E8B8B" }]}>
            KES {total_saved.toLocaleString()}
          </BodyText>
        </Card>

        <Card style={styles.card}>
          <SecondaryText style={styles.label}>Remaining</SecondaryText>
          <BodyText style={[styles.value, { color: "#FF6B6B" }]}>
            KES {total_remaining.toLocaleString()}
          </BodyText>
        </Card>
      </View>
    </View>
  );
};


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

  container: {
    gap: 14,
    marginBottom: 10,
  },

  mainCard: {
    padding: 22,
    borderRadius: 22,
    alignItems: "center",
  },

  mainLabel: {
    opacity: 0.7,
    marginBottom: 4,
    fontSize: 14,
  },

  mainValue: {
    fontSize: 34,
    fontWeight: "700",
  },

  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginTop: 12,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2E8B8B",
  },

  completed: {
    marginTop: 8,
    fontSize: 12,
    color: "#333",
    opacity: 0.7,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  card: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
  },

  label: {
    fontSize: 12,
    opacity: 0.6,
  },

  value: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
});
