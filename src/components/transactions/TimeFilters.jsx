import { View,  Pressable,StyleSheet } from "react-native";
import {  BodyText} from "../ThemeProvider/components";

const TIME_FILTERS = [
  "7 days",
  "This Month",
  "30 days",
  "3 months",
  "6 months",
  "1 year",
];

const TimeFilters = ({ onPeriodChange,selectedPeriod }) => {

  const handleSelectPeriod = (period) => {
    if (onPeriodChange) onPeriodChange(period);
  };
  return <>
    <View style={styles.filterRow}>
        {TIME_FILTERS.map((period) => (
        <Pressable
            key={period}
            onPress={() => handleSelectPeriod(period)}
            style={[
            styles.filterChip,
            selectedPeriod === period && styles.filterChipActive,
            ]}
        >
            <BodyText
            style={[
                styles.filterText,
                selectedPeriod === period && { color: "#FFFFFF", fontWeight: "600" },
            ]}
            >
            {period}
            </BodyText>
        </Pressable>
        ))}
    </View>
  </>
}

const styles = StyleSheet.create({
    filterRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginVertical: 12,
    },

    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "#F0F0F0",
    },

    filterChipActive: {
        backgroundColor: "#2E8B8B",
    },

    filterText: {
        fontSize: 12,
        color: "#333",
    },
});

export default TimeFilters