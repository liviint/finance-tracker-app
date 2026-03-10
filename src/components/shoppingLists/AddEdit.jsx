import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert } from "react-native";
import { Card, BodyText, Input, FormLabel } from "@/src/components/ThemeProvider/components";
import { useThemeStyles } from "@/src/hooks/useThemeStyles";
import { useRouter, useLocalSearchParams } from "expo-router";

const AddShoppingListPage = ({ navigation }) => {
    const {globalStyles} = useThemeStyles()
    const {id:uuid} = useLocalSearchParams()
    const router = useRouter()
    const [name, setName] = useState("");
    const [note, setNote] = useState("");

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Please enter a name for the shopping list.");
      return;
    }

    // For now, just log or navigate back with static data
    const newList = {
      uuid: Date.now().toString(), // temporary UUID for static testing
      name,
      note,
      itemCount: 0,
      completedCount: 0,
    };

    // Pass it back to previous screen (or you can integrate DB later)
    navigation.navigate("ShoppingLists", { newList });
  };

    return (
        <View style={globalStyles.container}>
            <BodyText style={globalStyles.title}>Add Shopping List</BodyText>
            <Card style={styles.card}>

                <View style={globalStyles.formGroup}>
                    <FormLabel style={styles.label}>List Name</FormLabel>
                    <Input
                        placeholder="Enter list name"
                        value={name}
                        onChangeText={setName}
                    />
                </View>
                
                <View style={globalStyles.formGroup}>
                    <FormLabel style={styles.label}>List Name</FormLabel>
                    <Input
                        placeholder="Enter a note"
                        value={note}
                        onChangeText={setNote}
                        multiline
                    />
                </View>

                <TouchableOpacity style={globalStyles.primaryBtn}onPress={handleAdd}>
                    <Text style={globalStyles.primaryBtnText}>
                        {uuid ? "Update Transaction" : "+ Save List"}
                    </Text>
                </TouchableOpacity>
            </Card>
        </View>
    );
};

export default AddShoppingListPage;

const styles = StyleSheet.create({

});