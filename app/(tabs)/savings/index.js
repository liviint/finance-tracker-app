import { View, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import {  useState, useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import { Card, BodyText, SecondaryText } from "../../../src/components/ThemeProvider/components";
import { getSavingsGoals } from "../../../src/db/savingsDb";
import { useThemeStyles } from "../../../src/hooks/useThemeStyles";
import { syncManager } from "../../../utils/syncManager";
import { AddButton } from "../../../src/components/common/AddButton";

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
      <AddButton 
        primaryAction={{route:"/savings/add",label:"Add Saving"}}
      />
    </View>
  );
}


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
