import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "../src/state";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#080B13" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="deposit" options={{ presentation: "card" }} />
          <Stack.Screen name="withdraw" options={{ presentation: "card" }} />
          <Stack.Screen name="refer" options={{ presentation: "card" }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
