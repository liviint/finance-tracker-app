import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useThemeStyles } from "../../../../src/hooks/useThemeStyles";
import { BodyText, SecondaryText,Card, Input } from "../../../../src/components/ThemeProvider/components";
import DeleteButton from "../../../../src/components/common/DeleteButton";
import { getDebtByUuid, offsetDebt, markDebtAsPaid, markDebtAsUnpaid } from "../../../../src/db/debtsDb";
import { useSQLiteContext } from "expo-sqlite";
import { dateFormat } from "../../../../utils/dateFormat";

export default function DebtDetailsScreen() {
  const router = useRouter()
  const isFocused = useIsFocused()
  const db = useSQLiteContext()
  const {globalStyles} = useThemeStyles()
  const { id:uuid } = useLocalSearchParams()

  const [debt, setDebt] = useState({
    uuid,
    title: "",
    counterparty_name: "",
    counterparty_type: "",
    amount: "",
    type: "owing",
    due_date: "",
    note: "",
    is_paid: 0,
  });

  const [showOffsetModal, setShowOffsetModal] = useState(false);
  const [offsetAmount, setOffsetAmount] = useState("");
  const [isOwed,setIsOwed] = useState(debt.type === "owed")

  const togglePaid = async () => {
  try {
    if (!debt.is_paid) {
      await markDebtAsPaid(db, debt.uuid);

      setDebt((prev) => ({
        ...prev,
        amount: 0,
        is_paid: 1,
      }));

      Alert.alert("Success", "Debt marked as paid!");
    } else {
      Alert.alert(
        "Unpaid not supported",
        "To undo payment, use offset history restoration."
      );
    }
  } catch (err) {
    Alert.alert("Error", err.message);
  }
};

  const handleOffset = async () => {
    const offset = Number(offsetAmount);

    if (!offset || offset <= 0) {
      Alert.alert("Invalid amount", "Enter a valid offset amount.");
      return;
    }

    if (offset > debt.amount) {
      Alert.alert("Too much", "Offset amount cannot be greater than remaining debt.");
      return;
    }

    try {
      const result = await offsetDebt(db, {
        debt_uuid: debt.uuid,
        offset_amount: offset,
        note: "Offset from details screen",
      });

      setDebt((prev) => ({
        ...prev,
        amount: result.remaining,
        is_paid: result.is_paid ? 1 : 0,
      }));

      setOffsetAmount("");
      setShowOffsetModal(false);

      Alert.alert("Success", "Offset applied successfully!");
  } catch (err) {
      Alert.alert("Error", err.message);
  }
};

  const handleDelete = () => {
    Alert.alert(
      "Delete Debt",
      "This debt will be removed. You can’t undo this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // await deleteDebt(db, uuid);
          },
        },
      ]
    );
  };

  useEffect(() => {
      let getDebt = async() => {
        let res = await getDebtByUuid(db,uuid)
        setDebt(res)
        setIsOwed(res.type === "owed")
      }
      getDebt()
  },[isFocused])

  return (
    <ScrollView style={globalStyles.container}>
      <BodyText style={globalStyles.title}>{debt.title}</BodyText>

      <Text
        style={[
          styles.amount,
          isOwed ? styles.owed : styles.owing,
        ]}
      >
        {isOwed  ? "+" : "-"} KES {debt.amount}
      </Text>

      <SecondaryText style={{...styles.counterparty, marginBottom:10}}>
        {debt.counterparty_type === "company" ? "🏢" : "👤"}{" "}
        {debt.counterparty_name}
      </SecondaryText>


      <Card  >
        <InfoRow label="Type" value={isOwed ? "Owes Me" :  "I Owe" } />
        <InfoRow label="Due Date" value={dateFormat(debt.due_date)} />
        <InfoRow
          label="Status"
          value={debt.is_paid ? "Paid" : "Unpaid"}
        />
        {debt.note ? (
          <InfoRow label="Note" value={debt.note} />
        ) : null}
      </Card>

      {!debt.is_paid && (
        <TouchableOpacity
          style={globalStyles.secondaryBtn}
          onPress={() => setShowOffsetModal(true)}
        >
          <BodyText style={globalStyles.secondaryBtnText}>Offset Amount</BodyText>
        </TouchableOpacity>
      )}

      {!debt.is_paid && <TouchableOpacity
        style={[
          globalStyles.primaryBtn,
          {marginTop:12,marginBottom:12},
          debt.is_paid ? styles.unpaidBtn : styles.paidBtn,
        ]}
        onPress={togglePaid}
      >
        <Text style={styles.actionText}>
          {debt.is_paid ? "Mark as Unpaid" : "Mark as Paid"}
        </Text>
      </TouchableOpacity>}

      
      {!debt.is_paid &&  <TouchableOpacity
        style={{...globalStyles.editBtn,marginBottom:12}}
        onPress={() =>router.push(`/debts/${uuid}/edit`)}
      >
        <Text style={globalStyles.editBtnText}>Edit Debt</Text>
      </TouchableOpacity>}

      <DeleteButton 
        handleOk={handleDelete} 
        item={"debt"}
        cusomStyles={{marginBottom:32}}
      />

      <Modal visible={showOffsetModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Card style={styles.modalContent}>
            <BodyText style={globalStyles.title}>Offset Debt</BodyText>
            <SecondaryText style={{marginBottom:12}}>
              Remaining: KES {debt.amount}
            </SecondaryText>

            <Input
              value={offsetAmount}
              onChangeText={setOffsetAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.modalInput}
            />

            <TouchableOpacity
              style={{...globalStyles.primaryBtn,marginBottom:12}}
              onPress={handleOffset}
            >
              <BodyText style={globalStyles.primaryBtnText}>Apply Offset</BodyText>
            </TouchableOpacity>

            <TouchableOpacity
              style={globalStyles.secondaryBtn}
              onPress={() => setShowOffsetModal(false)}
            >
              <BodyText style={globalStyles.secondaryBtnText}>Cancel</BodyText>
            </TouchableOpacity>
          </Card>
        </View>
      </Modal>
    </ScrollView>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <SecondaryText style={styles.infoLabel}>{label}</SecondaryText>
    <BodyText style={styles.infoValue}>{value}</BodyText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FAF9F7",
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  amount: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  owed: { color: "#2E8B8B" },
  owing: { color: "#FF6B6B" },
  counterparty: {
    marginTop: 4,
  },
  card: {
    marginTop: 20,
  },
  infoRow: { marginBottom: 12 },
  infoLabel: { 
    fontSize: 12, 
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionBtn: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionText: { color: "#FFF", fontWeight: "700" },
  secondaryBtn: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
  },
  secondaryText: { fontWeight: "600", color: "#333" },
  deleteBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  deleteText: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 12,
    padding: 16,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  modalCancel: {
    marginTop: 12,
    alignItems: "center",
  },
});