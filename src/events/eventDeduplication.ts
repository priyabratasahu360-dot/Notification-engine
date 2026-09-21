import { Event } from "../models/Event.js";
import { isDbConnected } from "../db/db.js";
import type { NotificationEvent } from "../types/event.js";

// In-memory fallback set for deduplication when DB is unavailable or offline
const memoryEventCache = new Set<string>();

export const registerEvent = async (event: NotificationEvent): Promise<boolean> => {
    if (!isDbConnected()) {
        if (memoryEventCache.has(event.eventId)) {
            return false;
        }
        memoryEventCache.add(event.eventId);
        // Clean cache after 1 hour to prevent unbounded growth
        setTimeout(() => memoryEventCache.delete(event.eventId), 3600000);
        return true;
    }

    try {
        await Event.create({
            eventId: event.eventId,
            type: event.type,
            source: event.source,
            timestamp: event.timestamp,
        });

        return true;
    } catch (error: unknown) {
        if (error && typeof error === "object" && "code" in error && error.code === 11000) {
            return false;
        }
        // If DB operation fails unexpectedly, fall back to memory check
        if (memoryEventCache.has(event.eventId)) {
            return false;
        }
        memoryEventCache.add(event.eventId);
        return true;
    }
};