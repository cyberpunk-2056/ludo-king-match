import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import { AppProvider } from "../src/state";

function NotificationRouter() {
  const router = useRouter();
  useEffect(() => {
    // when the player taps a match notification, open the relevant screen
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      const type = (resp.notification.request.content.data as any)?.type;
      if (type === "match_joined" || type === "match_live") router.push("/(tabs)/play");
      else if (type === "match_won" || type === "match_cancelled") router.push("/(tabs)/wallet");
    });
    return () => sub.remove();
  }, []);
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <NotificationRouter />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#060912" } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="create" options={{ presentation: "card" }} />
          <Stack.Screen name="deposit" options={{ presentation: "card" }} />
          <Stack.Screen name="withdraw" options={{ presentation: "card" }} />
          <Stack.Screen name="refer" options={{ presentation: "card" }} />
          <Stack.Screen name="support" options={{ presentation: "card" }} />
          <Stack.Screen name="rules" options={{ presentation: "card" }} />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
