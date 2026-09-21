import type { NotificationIntent } from "../notifications/notificationsIntent.js";
import type { EventHandler } from "./eventHandler.js";

export const noteSharedHandler: EventHandler = async (event) => {
    const recipientId = event.recipientId || (event.data?.recipientId as string);
    if (!recipientId) return null;

    const senderName = (event.data?.senderName as string) || event.senderId || "A collaborator";
    const noteTitle = (event.data?.noteTitle as string) || "Untitled Note";

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: "note.shared",
        source: event.source || "notesapp",
        title: `Note shared with you`,
        message: `${senderName} shared the note "${noteTitle}" with you.`,
        channels: ["in_app", "email"],
        data: event.data,
    };

    return intent;
};

export const noteReminderHandler: EventHandler = async (event) => {
    const recipientId = event.recipientId || (event.data?.recipientId as string);
    if (!recipientId) return null;

    const noteTitle = (event.data?.noteTitle as string) || "Note Reminder";
    const notePreview = (event.data?.reminderText as string) || (event.data?.noteTitle as string) || "Time to review your note.";

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: "note.reminder",
        source: event.source || "notesapp",
        title: `Reminder: ${noteTitle}`,
        message: notePreview,
        channels: ["in_app", "email"],
        data: event.data,
    };

    return intent;
};

export const noteCollaboratorAddedHandler: EventHandler = async (event) => {
    const recipientId = event.recipientId || (event.data?.recipientId as string);
    if (!recipientId) return null;

    const noteTitle = (event.data?.noteTitle as string) || "a note";
    const addedBy = (event.data?.addedByName as string) || event.senderId || "An editor";

    const intent: NotificationIntent = {
        eventId: event.eventId,
        recipientId,
        senderId: event.senderId,
        type: "note.collaborator_added",
        source: event.source || "notesapp",
        title: `Added as collaborator`,
        message: `${addedBy} added you as a collaborator on "${noteTitle}".`,
        channels: ["in_app"],
        data: event.data,
    };

    return intent;
};
