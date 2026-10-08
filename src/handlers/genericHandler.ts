import type { NotificationIntent } from "../notifications/notificationsIntent.js";
import type { EventHandler } from "./eventHandler.js";

/**
 * Universal Handler for any SaaS service (Chat, Billing, Notes, Orders, etc.)
 * Extracts standard notification fields directly from event or data.
 */
export const genericNotificationHandler: EventHandler = async (event) => {
    const recipientId = event.recipientId || (event.data?.recipientId as string);
    if (!recipientId) return null;

    // 1. Resolve notification title
    const senderName = (event.data?.senderName as string) || (event.senderId ? `User ${event.senderId}` : null);
    const title = (event.data?.title as string) || (senderName ? `Update from ${senderName}` : `New update from ${event.source}`);

    // 2. Resolve safe notification message / preview
    const rawMessage = (event.data?.message as string) 
        || (event.data?.text as string) 
        || (event.data?.body as string) 
        || (event.data?.description as string)
        || "You have a new notification";

    // Enforce safety limit on preview lengths (max 120 chars)
    const safeMessage = rawMessage.length > 120 
        ? `${rawMessage.substring(0, 117)}...` 
        : rawMessage;

    // 3. Clean sensitive fields from persisted data metadata
    const sanitizedData = { ...(event.data || {}) };
    delete sanitizedData.text; // Avoid storing raw chat/body text in metadata

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: event.type,
        source: event.source,
        title,
        message: safeMessage,
        channels: ["in_app", "push"],
        data: sanitizedData,
    };

    return intent;
};

