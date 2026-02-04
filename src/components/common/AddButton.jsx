import React, { useState } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";

export const AddButton = ({
  primaryAction,
  secondaryActions = [],
}) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const hasSecondary = secondaryActions.length > 0;

  const handleMainPress = () => {
    if (hasSecondary) {
      setMenuVisible(true);
    } else {
      router.push(primaryAction.route);
    }
  };

  const handleSelectAction = (route) => {
    setMenuVisible(false);
    router.push(route);
  };

  return (
    <>
      {/* Floating Button */}
      <Pressable style={styles.button} onPress={handleMainPress}>
        <Text style={styles.text}>＋</Text>
      </Pressable>

      {/* Popup Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        
        <Pressable
          style={styles.overlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.popup}>
            <Pressable
              style={styles.menuItem}
              onPress={() => handleSelectAction(primaryAction.route)}
            >
              <Text style={styles.menuText}>
                {primaryAction.label}
              </Text>
            </Pressable>

            {secondaryActions.map((action) => (
              <Pressable
                key={action.route}
                style={styles.menuItem}
                onPress={() => handleSelectAction(action.route)}
              >
                <Text style={styles.menuText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
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
