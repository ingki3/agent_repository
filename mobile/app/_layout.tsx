import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '@/i18n';
import { ThemeProvider, useTheme } from '@/ui/theme/ThemeProvider';

function StackWithTheme() {
  const { color, mode } = useTheme();
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: color('surface') },
          headerTintColor: color('text-primary'),
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: color('surface') },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Inbox' }} />
        <Stack.Screen name="buddies" options={{ title: '버디 목록' }} />
        <Stack.Screen
          name="chat/[id]"
          options={{ title: '채팅', headerBackButtonDisplayMode: 'minimal' }}
        />
        <Stack.Screen name="add-buddy" options={{ presentation: 'modal', title: '버디 추가' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StackWithTheme />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
