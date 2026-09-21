import { eventHandlers, defaultHandler } from "../handlers/eventHandlers.js";
import { evaluateDecision } from "../notifications/notificationDecision.js";
import { dispatchNotification } from "../notifications/notificationDispatcher.js";
import type { DispatchResult } from "../notifications/notificationDispatcher.js";
import type { NotificationIntent } from "../notifications/notificationsIntent.js";
import type { NotificationEvent } from "../types/event.js";

export interface ProcessEventResult {
    success: boolean;
    intent?: NotificationIntent | null | undefined;
    reason?: string | undefined;
    dispatch?: DispatchResult | undefined;
}

export const processEvent = async (event: NotificationEvent): Promise<ProcessEventResult> => {
    // 1. Resolve Handler (specific or fallback to default)
    const handler = eventHandlers[event.type] || defaultHandler;

    const intent = await handler(event);

    if (!intent) {
        return {
            success: false,
            reason: `Handler for event type '${event.type}' returned no notification intent (e.g. missing recipient)`,
        };
    }

    // 2. Decision Engine: Preferences & Muting Filters
    const decision = await evaluateDecision(intent);

    if (!decision.shouldDeliver) {
        console.log(`Notification blocked by decision engine: ${decision.reason}`);
        return {
            success: false,
            intent,
            reason: decision.reason,
        };
    }

    // 3. Dispatch across allowed channels (In-App WebSocket, Email, etc.)
    const dispatch = await dispatchNotification(intent, decision.allowedChannels);

    return {
        success: true,
        intent,
        dispatch,
    };
};