import { Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export const AddButton = ({to}) => {
    const router = useRouter();

    return (
        <Pressable
        style={styles.button}
        onPress={() => router.push(to)}
        >
        <Text style={styles.text}>＋</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#333333",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5, 
    },
    text: {
        color: "#fff",
        fontSize: 28,
        lineHeight: 28,
    },
});
