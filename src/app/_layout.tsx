import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="check-in" />
        <Stack.Screen name="geschiedenis" />
        <Stack.Screen name="instellingen" />
        <Stack.Screen name="vragen" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}