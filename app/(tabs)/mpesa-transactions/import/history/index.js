import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';

const ImportHistoryScreen = ({ history }) => {
  const mockHistory = history || [
    { fileName:'Jan.pdf', date:'2026-01-31', transactions:38, status:'Completed' },
    { fileName:'Feb.pdf', date:'2026-02-10', transactions:42, status:'Completed' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import History</Text>
      <FlatList
        data={mockHistory}
        keyExtractor={(item, i)=>i.toString()}
        renderItem={({item})=>(
          <View style={styles.row}>
            <Text>{item.fileName}</Text>
            <Text>{item.date}</Text>
            <Text>{item.transactions} txns</Text>
            <Text>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:'#FAF9F7' },
  title:{ fontSize:22, fontWeight:'700', marginBottom:16 },
  row:{ flexDirection:'row', justifyContent:'space-between', padding:12, backgroundColor:'#FFF', marginBottom:8, borderRadius:12 },
});

export default ImportHistoryScreen;
