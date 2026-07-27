import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";

import { savePushToken } from "../services/authService";

// Remote push notifications were removed from Expo Go on Android in SDK 53 —
// merely importing expo-notifications there throws. Everything in this file
// must only touch that module outside of that specific environment.
const isExpoGoAndroid = Platform.OS === "android" && Constants.appOwnership === "expo";

// Requests permission, grabs an Expo push token, and registers it with the
// backend so it can send budget alerts and recurring-transaction reminders.
// No-ops quietly on simulators/emulators, inside Expo Go on Android (works
// fine in a standalone/dev-client build there), or if permission is denied.
export const registerForPushNotificationsAsync = async () => {
  if (isExpoGoAndroid) return;
  if (!Device.isDevice) return;

  try {
    // Lazy-required so the module is never touched at all in the
    // unsupported Expo Go + Android combination.
    const Notifications = require("expo-notifications");

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: pushToken } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );

    if (pushToken) {
      await savePushToken(pushToken);
    }
  } catch (error) {
    console.log("Push notification registration failed:", error.message);
  }
};
