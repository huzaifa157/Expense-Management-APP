// Sends a push notification through Expo's push service.
// Silently no-ops if the user has no registered push token or the token
// isn't a valid Expo push token — this is best-effort, not a critical path.
const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken || !pushToken.startsWith("ExponentPushToken")) return;

  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: pushToken,
        title,
        body,
        data,
        sound: "default",
      }),
    });
  } catch (error) {
    console.error("Push notification failed:", error.message);
  }
};

module.exports = { sendPushNotification };
