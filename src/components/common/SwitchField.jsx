import { StyleSheet, View } from "react-native";
import { FormLabel, SecondaryText, CustomSwitch } from "../ThemeProvider/components";

export const SwitchField = ({ label, value, onChange }) => {
    return (
        <>
            <FormLabel>{label}</FormLabel>
            <View style={styles.switchRow}>
                <CustomSwitch value={value} onValueChange={onChange} />
                <SecondaryText style={{ fontWeight: "600" }}>
                    {value ? "Yes" : "No"}
                </SecondaryText>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    switchRow: {
        flexDirection: "row",
        justifyContent: "left",
        alignItems: "center",
        gap:10,
    },
})
