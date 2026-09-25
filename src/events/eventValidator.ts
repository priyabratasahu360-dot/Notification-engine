import type { NotificationEvent } from "../types/event.js";

export const validateEvent = (event: unknown): event is NotificationEvent => {
    if(!event || typeof event !== "object"){
        console.warn("[Validation Failed] Event is not an object:", event);
        return false;
    }
    const value = event as Record<string, unknown>;

    // Auto-normalize ObjectIds / numbers to string if needed
    if (value.eventId && typeof value.eventId !== "string") {
        value.eventId = String(value.eventId);
    }
    if (value.senderId && typeof value.senderId !== "string") {
        value.senderId = String(value.senderId);
    }
    if (value.recipientId && typeof value.recipientId !== "string") {
        value.recipientId = String(value.recipientId);
    }

    if(typeof value.eventId !== "string"){
        console.warn("[Validation Failed] eventId must be a string, received:", typeof value.eventId, value.eventId);
        return false;
    }
    if(typeof value.type !== "string"){
        console.warn("[Validation Failed] type must be a string, received:", typeof value.type, value.type);
        return false;
    }
    if(typeof value.source !== "string"){
        console.warn("[Validation Failed] source must be a string, received:", typeof value.source, value.source);
        return false;
    }
    if(typeof value.senderId !== "undefined" && typeof value.senderId !== "string"){
        console.warn("[Validation Failed] senderId must be a string, received:", typeof value.senderId, value.senderId);
        return false;
    }
    if(typeof value.recipientId !== "undefined" && typeof value.recipientId !== "string"){
        console.warn("[Validation Failed] recipientId must be a string, received:", typeof value.recipientId, value.recipientId);
        return false;
    }
    if(!value.data || typeof value.data !== "object"){
        console.warn("[Validation Failed] data must be an object, received:", typeof value.data, value.data);
        return false;
    }
    if(typeof value.timestamp !== "string"){
        console.warn("[Validation Failed] timestamp must be a string, received:", typeof value.timestamp, value.timestamp);
        return false;
    }
    return true;
};