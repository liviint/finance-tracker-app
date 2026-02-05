import { Picker } from "@react-native-picker/picker";
import {
    CustomPicker as StyledPicker ,
} from "../ThemeProvider/components";

export default function CustomPicker({
    selectedValue,
    onValueChange,
    items = [],
    placeholder,
    enabled = true,
}) {
    return (
        <StyledPicker
            selectedValue={selectedValue}
            enabled={enabled}
            onValueChange={onValueChange}
        >
        {placeholder && (
            <Picker.Item
                label={placeholder}
                value=""
                enabled={false}
            />
        )}

        {items.map((item) => (
            <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
            />
        ))}
        </StyledPicker>
    );
}
