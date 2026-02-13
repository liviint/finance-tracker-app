import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';

const ReviewTransactionsScreen = ({ route, navigation }) => {
  const { parsedTransactions } = route.params;
  const [transactions, setTransactions] = useState(parsedTransactions);

  const categories = ['Rent','Groceries','Transport','Savings','Bills','Fun','Family','Debt'];

  const updateCategory = (index, category) => {
    const updated = [...transactions];
    updated[index].category = category;
    setTransactions(updated);
  };

  const confirmImport = () => {
    navigation.navigate('ImportSuccess', { transactions });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.transaction}>
            <Text style={styles.text}>{item.name} - KSh {item.amount}</Text>
            <FlatList
              horizontal
              data={categories}
              renderItem={({ item: cat }) => (
                <Pressable
                  style={[styles.categoryButton, item.category === cat && styles.selected]}
                  onPress={() => updateCategory(index, cat)}
                >
                  <Text style={styles.categoryText}>{cat}</Text>
                </Pressable>
              )}
            />
          </View>
        )}
      />
      <Pressable style={styles.confirmButton} onPress={confirmImport}>
        <Text style={styles.confirmText}>Confirm Import</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, padding: 16, backgroundColor:'#FAF9F7' },
  title: { fontSize: 22, fontWeight:'700', marginBottom: 16 },
  transaction: { marginBottom:16, padding:12, backgroundColor:'#FFF', borderRadius:12 },
  text: { fontSize:16, fontWeight:'500', marginBottom:8 },
  categoryButton: { padding:8, backgroundColor:'#E0E0E0', borderRadius:8, marginRight:8 },
  selected: { backgroundColor:'#FF6B6B' },
  categoryText: { color:'#333', fontWeight:'500' },
  confirmButton: { padding:16, backgroundColor:'#2E8B8B', borderRadius:16, marginTop:16 },
  confirmText: { color:'#FFF', fontWeight:'700', textAlign:'center', fontSize:18 },
});

export default ReviewTransactionsScreen;
