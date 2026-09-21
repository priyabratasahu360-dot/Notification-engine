import { validateEvent } from "./eventValidator.js";
import type { NotificationEvent } from "../types/event.js";

export const ingestEvent = (event: unknown): NotificationEvent => {
        if(!validateEvent(event)){
            throw new Error("Invalid event");
        }
        return event;
    
}