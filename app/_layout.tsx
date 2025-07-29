// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#6200ee' },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Kabaddi Match Setup',}} />
      <Stack.Screen name="score" options={{ headerShown: false }} />
    </Stack>
    
  );
}
