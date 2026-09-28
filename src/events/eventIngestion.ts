import { validateEvent } from "./eventValidator.js";
import { eventHandlers } from "../handlers/eventHandlers.js";
import type { NotificationEvent } from "../types/event.js";

export const ingestEvent = (event: unknown): NotificationEvent => {
    if (!validateEvent(event)) {
        throw new Error("Invalid event payload: missing required fields or invalid structure");
    }

    if (!Object.prototype.hasOwnProperty.call(eventHandlers, event.type)) {
        const supportedTypes = Object.keys(eventHandlers);
        throw new Error(
            `Event type '${event.type}' does not exist on this notification engine.\nSupported event types: [${supportedTypes.join(", ")}]`
        );
    }

    return event;
};

