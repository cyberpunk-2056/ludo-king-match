import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { api } from "./api";

// Show a banner + play a sound even when the app is in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let registered = false;

/**
 * Ask for notification permission, get this device's Expo push token, and send
 * it to the backend so match events can reach the player even after they leave
 * the app. Safe to call repeatedly; silently no-ops when it can't register
 * (simulator, permission denied, or Expo Go where remote push is unavailable).
 */
export async function registerForPush(): Promise<void> {
  if (registered) return;
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Match updates",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4C84FF",
      });
    }
    if (!Device.isDevice) return; // push tokens aren't issued to simulators

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") return;

    const projectId =
      (Constants as any)?.expoConfig?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;
    const tokenResp = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    const token = tokenResp.data;
    if (!token) return;

    await api.registerPush(token, Platform.OS);
    registered = true;
  } catch (e) {
    // Remote push is not available in Expo Go (SDK 53+); needs a dev/EAS build.
    console.log("push registration skipped:", (e as Error)?.message);
  }
}
