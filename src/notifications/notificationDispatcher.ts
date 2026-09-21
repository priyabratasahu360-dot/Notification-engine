import { Notification } from "../models/Notification.js";
import { sendNotification } from "../lib/websocketServer.js";
import type { NotificationIntent, NotificationChannel } from "./notificationsIntent.js";

export interface DispatchResult {
    persistedId?: string | undefined;
    deliveredChannels: NotificationChannel[];
    inAppDelivered: boolean;
    emailDelivered: boolean;
}

export const dispatchNotification = async (
    intent: NotificationIntent,
    allowedChannels: NotificationChannel[]
): Promise<DispatchResult> => {
    let persistedId: string | undefined = undefined;
    let createdAt = new Date().toISOString();

    // 1. Persist notification to Database
    try {
        const doc: Record<string, unknown> = {
            eventId: intent.eventId,
            source: intent.source,
            recipientId: intent.recipientId,
            title: intent.title,
            type: intent.type,
            message: intent.message,
            channel: allowedChannels.includes("in_app") ? "in_app" : (allowedChannels[0] || "in_app"),
            data: intent.data || {},
            read: false,
        };
        if (intent.senderId) {
            doc.senderId = intent.senderId;
        }

        const savedNotification = await Notification.create(doc);
        if (savedNotification) {
            persistedId = String(savedNotification._id);
            createdAt = savedNotification.createdAt.toISOString();
        }
    } catch (err: unknown) {
        console.warn("Notice: could not save notification to MongoDB (DB may be offline):", err);
    }

    const payload = {
        id: persistedId || intent.eventId,
        eventId: intent.eventId,
        recipientId: intent.recipientId,
        senderId: intent.senderId,
        source: intent.source,
        type: intent.type,
        title: intent.title,
        message: intent.message,
        data: intent.data,
        read: false,
        createdAt,
    };

    const deliveredChannels: NotificationChannel[] = [];
    let inAppDelivered = false;
    let emailDelivered = false;

    // 2. Real-time In-App Dispatch via WebSocket
    if (allowedChannels.includes("in_app")) {
        try {
            sendNotification(intent.recipientId, {
                event: "notification.received",
                data: payload,
            });
            inAppDelivered = true;
            deliveredChannels.push("in_app");
            console.log(`[In-App Dispatch] WebSocket alert pushed to recipient: ${intent.recipientId}`);
        } catch (wsErr) {
            console.error("Error sending WebSocket notification:", wsErr);
        }
    }

    // 3. Email Channel Dispatch (Pluggable Logger / Dispatcher)
    if (allowedChannels.includes("email")) {
        console.log(`[Email Dispatch] Simulated email sent to user ${intent.recipientId}: Subject: "${intent.title}" | Body: "${intent.message}"`);
        emailDelivered = true;
        deliveredChannels.push("email");
    }

    return {
        persistedId,
        deliveredChannels,
        inAppDelivered,
        emailDelivered,
    };
};
