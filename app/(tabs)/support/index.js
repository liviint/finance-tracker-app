import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as InAppPurchases from "expo-in-app-purchases";

const itemSkus = ["support_50", "support_100", "support_200"]; // Google Play product IDs

const SupportPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function initIAP() {
      await InAppPurchases.connectAsync();
      const { responseCode, results } = await InAppPurchases.getProductsAsync(itemSkus);
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        setProducts(results);
      }

      InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          results.forEach(async (purchase) => {
            if (!purchase.acknowledged) {
              await InAppPurchases.finishTransactionAsync(purchase, true);
              Alert.alert("Thank you!", "Your support keeps ZeniaMoney running 💖");
            }
          });
        } else if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
          console.log("User cancelled purchase");
        } else {
          console.warn("Purchase failed", errorCode);
        }
      });
    }

    initIAP();

    return () => InAppPurchases.disconnectAsync();
  }, []);

  const handlePurchase = async (sku) => {
    await InAppPurchases.purchaseItemAsync(sku);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>❤️ Support ZeniaMoney</Text>
      <Text style={styles.subtitle}>Even Ksh 50 helps keep the app running 💖</Text>

      {products.map((p) => (
        <TouchableOpacity
          key={p.productId}
          style={styles.button}
          onPress={() => handlePurchase(p.productId)}
        >
          <Text style={styles.buttonText}>{p.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#FAF9F7" },
  title: { fontSize: 24, fontWeight: "700", color: "#FF6B6B", marginBottom: 10, textAlign: "center" },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 20, color: "#333" },
  button: { backgroundColor: "#FF6B6B", padding: 14, borderRadius: 12, marginVertical: 8, width: "80%", alignItems: "center" },
  buttonText: { color: "#FAF9F7", fontWeight: "600", fontSize: 16 },
});

export default SupportPage;