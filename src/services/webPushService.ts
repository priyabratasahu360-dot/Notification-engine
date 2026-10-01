import webpush from "../lib/webPush.js";
import { UserPreference } from "../models/UserPreference.js";

interface PushNotification {
  _id: string;
  title?: string;
  body?: string;
  url?: string;
}

export async function sendWebPush(
  userId: string,
  notification: PushNotification,
): Promise<boolean> {
  const preference = await UserPreference.findOne({ userId });

  if (!preference?.notificationsEnabled) return false;
  if (!preference.channels.push) return false;

  const subscriptions = preference.pushSubscriptions ?? [];

  if (subscriptions.length === 0) return false;

  const payload = JSON.stringify({
    notificationId: String(notification._id),
    title: notification.title ?? "New notification",
    body: notification.body ?? "You have a new notification",
    url: notification.url ?? "/",
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, payload, { TTL: 3600 });

        return true;
      } catch (error: unknown) {
        const statusCode = typeof error === "object" && error !== null && "statusCode" in error
            ? (error as { statusCode?: number }).statusCode
            : undefined;

        if (statusCode === 404) {
          await UserPreference.updateOne({ userId },
            {
              $pull: {
                pushSubscriptions: {
                  endpoint: subscription.endpoint
                }
              }
            });
          return false;
        }

        console.error("Web Push delivery failed:", error);
        return false;
      }
    }),
  );

  return results.some((result) => 
    result.status === "fulfilled" && result.value === true
  )
}
