import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';

const UploadStatementScreen = ({ navigation }) => {
  const [file, setFile] = useState(null);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (res.type === 'success') setFile(res);
  };

  const handleUpload = () => {
    if (!file) return alert('Please select a file first');
    navigation.navigate('Processing', { file });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload M-Pesa Statement</Text>
      <Pressable style={styles.uploadButton} onPress={pickFile}>
        <Text style={styles.uploadText}>Select PDF</Text>
      </Pressable>
      {file && <Text style={styles.fileName}>{file.name}</Text>}
      <Pressable style={styles.confirmButton} onPress={handleUpload}>
        <Text style={styles.confirmText}>Upload</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FAF9F7' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  uploadButton: { padding: 20, backgroundColor: '#2E8B8B', borderRadius: 16, marginBottom: 10 },
  uploadText: { color: '#FAF9F7', fontSize: 18, textAlign: 'center' },
  fileName: { fontSize: 16, marginVertical: 10, color: '#333333' },
  confirmButton: { padding: 20, backgroundColor: '#FF6B6B', borderRadius: 16 },
  confirmText: { color: '#FAF9F7', textAlign: 'center', fontWeight: '600', fontSize: 18 },
});

export default UploadStatementScreen;
