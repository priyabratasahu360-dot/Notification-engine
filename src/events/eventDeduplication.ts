import { Event } from "../models/Event.js";
import { isDbConnected } from "../db/db.js";
import type { NotificationEvent } from "../types/event.js";

// In-memory fallback set for deduplication when DB is unavailable or offline
const memoryEventCache = new Set<string>();

const getEventKey = (source: string, eventId: string): string => `${source}:${eventId}`;

export const registerEvent = async (event: NotificationEvent): Promise<boolean> => {
    const key = getEventKey(event.source, event.eventId);

    if (!isDbConnected()) {
        if (memoryEventCache.has(key)) {
            return false;
        }
        memoryEventCache.add(key);
        // Clean cache after 1 hour to prevent unbounded growth
        setTimeout(() => memoryEventCache.delete(key), 3600000);
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
        if (memoryEventCache.has(key)) {
            return false;
        }
        memoryEventCache.add(key);
        return true;
    }
};

/**
 * Rollback/unregister event if downstream processing crashes or fails,
 * ensuring producer retries are not permanently dropped.
 */
export const unregisterEvent = async (source: string, eventId: string): Promise<void> => {
    const key = getEventKey(source, eventId);
    memoryEventCache.delete(key);

    if (isDbConnected()) {
        try {
            await Event.deleteOne({ source, eventId });
        } catch (err) {
            console.warn("Could not unregister failed event from DB:", err);
        }
    }
};