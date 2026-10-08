import { validateEvent } from "./eventValidator.js";
import { eventHandlers } from "../handlers/eventHandlers.js";
import type { NotificationEvent } from "../types/event.js";

export const ingestEvent = (event: unknown): NotificationEvent => {
    if (!validateEvent(event)) {
        throw new Error("Invalid event payload: missing required fields or invalid structure");
    }

    return event;
};


