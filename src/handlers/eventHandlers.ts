import type { EventHandler } from "./eventHandler.js";
import { chatMessageSentHandler, chatMentionHandler, groupChatHandler } from "./chatHandlers.js";
import { noteSharedHandler, noteReminderHandler, noteCollaboratorAddedHandler, noteCommentHandler } from "./noteHandlers.js";
import { genericNotificationHandler } from "./genericHandler.js";

export const eventHandlers: Record<string, EventHandler> = {
    //=============================================//
                // ChatApp events //
    //=============================================//
            //Industry standard event types:
            /*
            Singular nouns
            Past tense verbs
            */

    // use these for sending 1 to 1 messaging
    "chat.message.created": chatMessageSentHandler,
    "chat.message_sent": chatMessageSentHandler,

    // use these for group related activity
    "chat.mention.created": chatMentionHandler,
    "chat.group_message.created": groupChatHandler, // 


    //=============================================//
                // NotesApp events //
    //=============================================//
    "note.shared": noteSharedHandler,
    "note.reminder": noteReminderHandler,
    "note.comment.created": noteCommentHandler,
    "note.collaborator_added": noteCollaboratorAddedHandler,

    // Generic / Extensible
    "generic.notification": genericNotificationHandler,
};

// Fallback handler for any unregistered event type
export const defaultHandler: EventHandler = genericNotificationHandler;