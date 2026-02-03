import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const PROJECT_ID = '6f32f42e-5f3c-4bf7-8c72-0a7c56000101';

export default function OtherScreenIndex() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Other Screen
      </Text>
      
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Test Routes:
      </Text>
      
      <Link 
        href={`/project/${PROJECT_ID}`}
        style={{ color: 'blue', fontSize: 16, marginBottom: 10 }}
      >
        ✅ Test: /project/[id] (should work)
      </Link>
      
    </View>
  );
}