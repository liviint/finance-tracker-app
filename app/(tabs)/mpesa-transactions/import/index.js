import { View, Text, Pressable, StyleSheet } from 'react-native';

const ImportEntryScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Transactions</Text>

      <Pressable style={styles.card} onPress={() => navigation.navigate('Upload')}>
        <Text style={styles.cardText}>Upload M-Pesa Statement</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => navigation.navigate('SMSImport')}>
        <Text style={styles.cardText}>Import from SMS</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => navigation.navigate('ManualEntry')}>
        <Text style={styles.cardText}>Manual Entry</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAF9F7' },
  title: { fontSize: 24, fontWeight: '700', color: '#333333', marginBottom: 20 },
  card: {
    padding: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    marginBottom: 16,
  },
  cardText: { color: '#FAF9F7', fontSize: 18, fontWeight: '600' },
});

export default ImportEntryScreen;
