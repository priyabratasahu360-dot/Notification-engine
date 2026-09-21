import type { NotificationEvent } from "../types/event.js";

export const validateEvent = (event: unknown): event is NotificationEvent => {
    if(!event || typeof event !== "object"){
        return false;
    }
    const value = event as Record<string, unknown>;
    if(typeof value.eventId !== "string"){
        return false;
    }
    if(typeof value.type !== "string"){
        return false;
    }
    if(typeof value.source !== "string"){
        return false;
    }
    if(typeof value.senderId !== "undefined" && typeof value.senderId !== "string"){
        return false;
    }
    if(typeof value.recipientId !== "undefined" && typeof value.recipientId !== "string"){
        return false;
    }
    if(!value.data || typeof value.data !== "object"){
        return false;
    }
    if(typeof value.timestamp !== "string"){
        return false;
    }
    return true;
}