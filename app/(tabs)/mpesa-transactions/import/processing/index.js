import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';

const ProcessingScreen = ({ route, navigation }) => {
  const { file } = route.params;

  useEffect(() => {
    // Simulate parsing delay
    setTimeout(() => {
      navigation.navigate('ReviewTransactions');
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Processing Statement...</Text>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.status}>Extracting transactions...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF9F7' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: '#333333' },
  status: { fontSize: 16, marginTop: 10 },
});

export default ProcessingScreen;
