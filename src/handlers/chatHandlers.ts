import type { NotificationIntent } from "../notifications/notificationsIntent.js";
import type { EventHandler } from "./eventHandler.js";

export const chatMessageSentHandler: EventHandler = async (event) => {
    const recipientId = event.recipientId || (event.data?.recipientId as string);
    if (!recipientId) return null;

    const senderName = (event.data?.senderName as string) || event.senderId || "Someone";

    // Privacy-first sanitization:
    // If the producer provided explicit preview text, truncate it safely to max 60 chars.
    // If no text or privacy mode is preferred, show generic alert: "Sent you a message"
    const rawText = (event.data?.text as string) || (event.data?.message as string);
    const previewMessage = rawText
        ? (rawText.length > 60 ? `${rawText.substring(0, 57)}...` : rawText)
        : "Sent you a message";

    // Strip sensitive raw message bodies from the metadata payload stored in DB
    const sanitizedData = { ...(event.data || {}) };
    delete sanitizedData.text;
    delete sanitizedData.message;

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: "chat.message.created",
        source: event.source,
        title: `New message from ${senderName}`,
        message: previewMessage,
        channels: ["in_app", "push"],
        data: sanitizedData,
    };

    return intent;
};

export const chatMentionHandler: EventHandler = async (event) => {
    const recipientId = event.recipientId || (event.data?.recipientId as string);
    if (!recipientId) return null;

    const senderName = (event.data?.senderName as string) || event.senderId || "Someone";
    const channelName = (event.data?.channelName as string) || "a conversation";

    // Clean sensitive raw message bodies
    const sanitizedData = { ...(event.data || {}) };
    delete sanitizedData.text;
    delete sanitizedData.message;

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: "chat.mention",
        source: event.source,
        title: `${senderName} mentioned you`,
        message: `${senderName} mentioned you in #${channelName}`,
        channels: ["in_app", "push"],
        data: sanitizedData,
    };

    return intent;
};

export const groupChatHandler: EventHandler = async (event) => {
    const senderName = (event.data?.senderName as string) || event.senderId || "Someone";
    const groupName = (event.data?.groupName as string) || "group";
    const recipientId = event.recipientId || (event.data?.recipientId as string);

    if (!recipientId) return null;

    // Clean sensitive raw message bodies
    const sanitizedData = { ...(event.data || {}) };
    delete sanitizedData.text;
    delete sanitizedData.message;

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: "chat.group_message.created",
        source: event.source,
        title: `New message in ${groupName}`,
        message: `${senderName} sent a message in ${groupName}`,
        channels: ["in_app", "push"],
        data: sanitizedData,
    };

    return intent;
};

