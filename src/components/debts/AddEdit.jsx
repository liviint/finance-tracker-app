import  { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView
} from "react-native";
import { useLocalSearchParams , useRouter} from "expo-router";
import { useThemeStyles } from "../../hooks/useThemeStyles";
import { BodyText, FormLabel, Input, TextArea , Card} from "../ThemeProvider/components";
import { upsertDebt, getDebtByUuid } from "../../db/debtsDb";
import { useSQLiteContext } from "expo-sqlite";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddEdit() {
    const db = useSQLiteContext()
    const { globalStyles } = useThemeStyles()
    const router = useRouter()
    const {id:uuid} = useLocalSearchParams()
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [form,setForm] = useState({
        title:"",
        counterparty_name:"",
        counterparty_type:"person",
        type:"owed",
        isCompany:false,
        amount:"",
        note:"",
        due_date:new Date(),
    })

    const handleFormChange = (key,value) => {
        setForm(prev => ({
            ...prev,
            [key]:value
        }))
    }

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const updated = new Date(selectedDate);
            console.log(updated,"hello updated")
            setForm(prev => ({...prev,due_date:updated}))
        }
    };

    const handleSave = async () => {
        if (!form.title || !form.counterparty_name || !form.amount) return;
        console.log("Saving debt:", form);
        await upsertDebt(db, form);
        router.back()
    };

    useEffect(() => {
        if(!uuid) return
        let getDebt = async() => {
            let debt = await getDebtByUuid(db,uuid)
            console.log(debt,"hello debt")
            setForm(prev => ({...prev,...debt,due_date:new Date(debt.due_date)}))
        }
        getDebt()
    },[])

    return (
        <ScrollView style={globalStyles.container}>
            <Text style={globalStyles.title}>
                {uuid ? "Edit Debt" : "Add Debt"}
            </Text>

            <Card>
                <View style={globalStyles.formGroup}>
                    <FormLabel style={styles.label}>Title</FormLabel>
                    <Input
                        value={form.title}
                        onChangeText={(value) => handleFormChange("title",value)}
                        placeholder="e.g. KCB Loan"
                        style={styles.input}
                    />
                </View>
                <View style={globalStyles.formGroup}>
                    <FormLabel >Who is this with?</FormLabel>
                    <Input
                        value={form.counterparty_name}
                        onChangeText={(value) => handleFormChange("counterparty_name",value)}
                        placeholder="Person or company name"
                    />
                </View>
                <View style={globalStyles.formGroup}>
                    <View style={styles.switchRow}>
                        <FormLabel >
                        {form.counterparty_type === "company" ? "Company" : "Person"}
                        </FormLabel>
                        <Switch 
                            value={form.counterparty_type === "company"} 
                            onValueChange={() =>
                                handleFormChange("counterparty_type",form.counterparty_type === "company" ?   "person" : "company")
                            }
                        />
                    </View>
                </View>

                <View style={globalStyles.formGroup}>
                    <FormLabel>Amount</FormLabel>
                    <Input
                        value={String(form.amount)}
                        onChangeText={(value) => handleFormChange("amount",value)}
                        placeholder="0"
                        keyboardType="numeric"
                    />
                </View>

                <View style={globalStyles.formGroup}>
                    <FormLabel>Date & Time</FormLabel>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={{
                        flex: 1,
                        paddingVertical: 8,
                        paddingHorizontal: 4,
                        alignItems: "center",
                        ...globalStyles.formBorder
                        }}
                    >
                        <BodyText>{form.due_date.toDateString()}</BodyText>
                    </TouchableOpacity>
                    </View>
                
                    {showDatePicker && (
                    <DateTimePicker
                        value={form.due_date}
                        mode="date"
                        display="calendar"
                        onChange={handleDateChange}
                    />
                    )}
                </View>

                <View style={globalStyles.formGroup}>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[
                                styles.toggleBtn,
                                form.type === "owing" && styles.toggleActiveOwed,
                            ]}
                            onPress={() => handleFormChange("type","owing")}
                        >
                        <BodyText style={[styles.toggleText,form.type === "owing" && styles.toggleActiveText]}>I Owe</BodyText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.toggleBtn,
                                form.type === "owed" && styles.toggleActiveOwing,
                            ]}
                            onPress={() => handleFormChange("type","owed")}
                        >
                        <BodyText style={[styles.toggleText,form.type === "owed" && styles.toggleActiveText]}>Owes Me</BodyText>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={globalStyles.formGroup}>
                    <FormLabel >Note (optional)</FormLabel>
                    <TextArea
                        value={form.note}
                        onChangeText={(value) => handleFormChange("note",value)}
                        placeholder="Any extra info"
                        multiline
                    />
                </View>

                <TouchableOpacity style={globalStyles.primaryBtn} onPress={handleSave}>
                    <BodyText style={globalStyles.primaryBtnText}>
                        {uuid ? "Update Debt" : "Save Debt"}
                    </BodyText>
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