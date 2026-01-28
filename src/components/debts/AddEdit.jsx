import  { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView
} from "react-native";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { BodyText, FormLabel, Input, TextArea , Card} from "../ThemeProvider/components";

export default function AddEdit({ navigation }) {
    const { globalStyles } = useThemeStyles()
    const [title, setTitle] = useState("");
    const [counterpartyName, setCounterpartyName] = useState("");
    const [isCompany, setIsCompany] = useState(false);
    const [amount, setAmount] = useState("");
    const [isOwed, setIsOwed] = useState(true);
    const [note, setNote] = useState("");

    const handleSave = async () => {
        if (!title || !counterpartyName || !amount) return;

        const payload = {
        title,
        counterparty_name: counterpartyName,
        counterparty_type: isCompany ? "company" : "person",
        amount: Number(amount),
        type: isOwed ? "owed" : "owing",
        note,
        };

        console.log("Saving debt:", payload);

        // await upsertDebt(db, payload);
        navigation.goBack();
    };

    return (
        <ScrollView style={globalStyles.container}>
            <Text style={globalStyles.title}>Add Debt</Text>

            <Card>
                <View style={globalStyles.formGroup}>
                    <FormLabel style={styles.label}>Title</FormLabel>
                    <Input
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g. KCB Loan"
                        style={styles.input}
                    />
                </View>
                <View style={globalStyles.formGroup}>
                    <FormLabel >Who is this with?</FormLabel>
                    <Input
                        value={counterpartyName}
                        onCangeText={setCounterpartyName}
                        placeholder="Person or company name"
                    />
                </View>
                <View style={globalStyles.formGroup}>
                    <View style={styles.switchRow}>
                        <FormLabel >
                        {isCompany ? "Company" : "Person"}
                        </FormLabel>
                        <Switch value={isCompany} onValueChange={setIsCompany} />
                    </View>
                </View>

                <View style={globalStyles.formGroup}>
                    <FormLabel>Amount</FormLabel>
                    <Input
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0"
                        keyboardType="numeric"
                    />
                </View>

                <View style={globalStyles.formGroup}>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                        style={[
                            styles.toggleBtn,
                            isOwed && styles.toggleActiveOwed,
                        ]}
                        onPress={() => setIsOwed(true)}
                        >
                        <BodyText style={[styles.toggleText,isOwed && styles.toggleActiveText]}>I Owe</BodyText>
                        </TouchableOpacity>

                        <TouchableOpacity
                        style={[
                            styles.toggleBtn,
                            !isOwed && styles.toggleActiveOwing,
                        ]}
                        onPress={() => setIsOwed(false)}
                        >
                        <BodyText style={[styles.toggleText,!isOwed && styles.toggleActiveText]}>Owes Me</BodyText>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={globalStyles.formGroup}>
                    <FormLabel >Note (optional)</FormLabel>
                    <TextArea
                        value={note}
                        onChangeText={setNote}
                        placeholder="Any extra info"
                        multiline
                    />
                </View>

                <TouchableOpacity style={globalStyles.primaryBtn} onPress={handleSave}>
                    <BodyText style={globalStyles.primaryBtnText}>Save Debt</BodyText>
                </TouchableOpacity>
                
            </Card>

        
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: "#333",
  },
  toggleRow: {
    flexDirection: "row",
    marginVertical: 16,
    gap:10,
  },
  toggleBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  toggleActiveOwed: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  toggleActiveOwing: {
    backgroundColor: "#2E8B8B",
    borderColor: "#2E8B8B",
  },
  toggleText: {
    fontWeight: "600",
  },
  toggleActiveText:{
    color:"#fff"
  }
});