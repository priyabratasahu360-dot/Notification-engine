import type { NotificationIntent } from "../notifications/notificationsIntent.js";
import type { EventHandler } from "./eventHandler.js";

export const genericNotificationHandler: EventHandler = async (event) => {
    const recipientId = event.recipientId || (event.data?.recipientId as string);
    if (!recipientId) return null;

    const title = (event.data?.title as string) || `Notification from ${event.source}`;
    const message = (event.data?.message as string) || (event.data?.text as string) || (event.data?.body as string) || "You have a new update";

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: event.type,
        source: event.source,
        title,
        message,
        channels: ["in_app", "email"],
        data: event.data,
    };

    return intent;
};
