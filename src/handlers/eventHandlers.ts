import type { EventHandler } from "./eventHandler.js";
import { chatMessageSentHandler, chatMentionHandler } from "./chatHandlers.js";
import { noteSharedHandler, noteReminderHandler, noteCollaboratorAddedHandler } from "./noteHandlers.js";
import { genericNotificationHandler } from "./genericHandler.js";

export const eventHandlers: Record<string, EventHandler> = {
    // Legacy / ChatApp events
    "message.created": chatMessageSentHandler,
    "chat.message_sent": chatMessageSentHandler,
    "chat.mention": chatMentionHandler,

    // NotesApp events
    "note.shared": noteSharedHandler,
    "note.reminder": noteReminderHandler,
    "note.collaborator_added": noteCollaboratorAddedHandler,

    // Generic / Extensible
    "generic.notification": genericNotificationHandler,
};

// Fallback handler for any unregistered event type
export const defaultHandler: EventHandler = genericNotificationHandler;