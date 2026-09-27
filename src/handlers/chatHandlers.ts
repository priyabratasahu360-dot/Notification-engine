import type { NotificationIntent } from "../notifications/notificationsIntent.js";
import type { EventHandler } from "./eventHandler.js";

export const chatMessageSentHandler: EventHandler = async (event) => {
    const recipientId = event.recipientId || (event.data?.recipientId as string);
    if (!recipientId) return null;

    const senderName = (event.data?.senderName as string) || event.senderId || "Someone";
    const textPreview = (event.data?.text as string) || (event.data?.message as string) || "sent you a message";

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: "chat.message.created",
        source: event.source,
        title: `New message from ${senderName}`,
        message: textPreview.length > 100 ? `${textPreview.substring(0, 97)}...` : textPreview,
        channels: ["in_app", "email"],
        data: event.data,
    };

    return intent;
};

export const chatMentionHandler: EventHandler = async (event) => {
    const recipientId = event.recipientId || (event.data?.recipientId as string);
    if (!recipientId) return null;

    const senderName = (event.data?.senderName as string) || event.senderId || "Someone";
    const channelName = (event.data?.channelName as string) || "a conversation";

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: "chat.mention",
        source: event.source,
        title: `${senderName} mentioned you`,
        message: `${senderName} mentioned you in #${channelName}`,
        channels: ["in_app", "email"],
        data: event.data,
    };

    return intent;
};

//for now the client like chatapp needs to fire multiple event to engine for each recipient in group
//to be updated later
export const groupChatHandler: EventHandler = async(event) => {
    const senderName = (event.data?.senderName as string) || event.senderId || "Someone";
    const groupName = (event.data?.groupName as string) || "Your";
    const recipientId = event.recipientId || (event.data?.recipientId as string);

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: "chat.group_message.created",
        source: event.source,
        title: `You have new message in ${groupName} group`,
        message: `New message from ${senderName}`,
        channels: ["in_app"],
        data:event.data
    };

    return intent;
}
