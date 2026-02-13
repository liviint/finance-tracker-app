import { View, Text, Pressable, StyleSheet } from 'react-native';

const ImportSuccessScreen = ({ route, navigation }) => {
  const { transactions } = route.params;

  const numImported = transactions.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Successful!</Text>
      <Text style={styles.summary}>{numImported} transactions imported.</Text>
      <Pressable style={styles.viewButton} onPress={() => navigation.navigate('Transactions')}>
        <Text style={styles.viewText}>View Transactions</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#FAF9F7' },
  title: { fontSize:24, fontWeight:'700', marginBottom:12 },
  summary: { fontSize:18, marginBottom:20 },
  viewButton: { padding:16, backgroundColor:'#FF6B6B', borderRadius:16 },
  viewText: { color:'#FFF', fontWeight:'700', textAlign:'center', fontSize:18 },
});

export default ImportSuccessScreen;
