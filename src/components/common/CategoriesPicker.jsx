import { useState, useEffect } from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { FormLabel, CustomPicker} from "../ThemeProvider/components";
import { useSQLiteContext } from "expo-sqlite";
import { getCategories } from "../../db/transactionsDb";
import { useThemeStyles } from "../../hooks/useThemeStyles";

export default function CategoriesPicker({form,handleCategoryChange}) {

    const {globalStyles} = useThemeStyles()
    const db = useSQLiteContext()
    const [categories,setCategories] = useState([])

    useEffect(() => {
        let fetchCategories = async () => {
        try {
            let categories = await getCategories(db)
            setCategories(categories)
        } catch (error) {
            console.log(error,"hello error")
        }
        }
        fetchCategories()
    },[])

    return (
        <View style={globalStyles.formGroup}>
            <FormLabel>Category</FormLabel>

            <View
            >
            <CustomPicker
                selectedValue={categories.find(cate => cate.uuid === form.category_uuid)}
                onValueChange={(value) => handleCategoryChange(value)}
            >
                <Picker.Item label="Select category" value={null} />

                {categories.map((cat) => (
                <Picker.Item
                    key={cat.uuid}
                    label={`${cat.icon} ${cat.name}`}
                    value={cat}
                />
                ))}
            </CustomPicker>
            </View>
        </View>
    );
}