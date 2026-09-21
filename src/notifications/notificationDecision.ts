import type { NotificationIntent, NotificationChannel } from "./notificationsIntent.js";
import { getUserPreference } from "./preferenceService.js";

export interface DecisionResult {
    shouldDeliver: boolean;
    reason?: string;
    allowedChannels: NotificationChannel[];
}

export const evaluateDecision = async (intent: NotificationIntent): Promise<DecisionResult> => {
    const pref = await getUserPreference(intent.recipientId);

    // 1. Global kill-switch check
    if (!pref.notificationsEnabled) {
        return {
            shouldDeliver: false,
            reason: `User ${intent.recipientId} has disabled all notifications`,
            allowedChannels: [],
        };
    }

    // 2. Source muting (e.g., user muted 'chatapp')
    if (pref.mutedSources.includes(intent.source)) {
        return {
            shouldDeliver: false,
            reason: `User has muted notifications from source '${intent.source}'`,
            allowedChannels: [],
        };
    }

    // 3. Type muting (e.g., user muted 'chat.mention')
    if (pref.mutedTypes.includes(intent.type)) {
        return {
            shouldDeliver: false,
            reason: `User has muted notifications of type '${intent.type}'`,
            allowedChannels: [],
        };
    }

    // 4. Resolve delivery channels based on requested and enabled channels
    const requestedChannels = intent.channels && intent.channels.length > 0 
        ? intent.channels 
        : (["in_app", "email"] as NotificationChannel[]);

    const allowedChannels: NotificationChannel[] = [];
    if (pref.channels.inApp && requestedChannels.includes("in_app")) {
        allowedChannels.push("in_app");
    }
    if (pref.channels.email && requestedChannels.includes("email")) {
        allowedChannels.push("email");
    }

    if (allowedChannels.length === 0) {
        return {
            shouldDeliver: false,
            reason: `All requested channels (${requestedChannels.join(", ")}) are disabled in user preferences`,
            allowedChannels: [],
        };
    }

    return {
        shouldDeliver: true,
        allowedChannels,
    };
};

export const shouldNotify = (intent: NotificationIntent): boolean => {
    return true;
};