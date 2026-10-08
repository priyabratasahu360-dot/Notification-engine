import { UserPreference } from "../models/UserPreference.js";
import type { NotificationChannel } from "./notificationsIntent.js";

export interface UserPreferencesDTO {
    userId: string;
    notificationsEnabled: boolean;
    channels: {
        inApp: boolean;
        email: boolean;
        push: boolean
    };
    mutedSources: string[];
    mutedTypes: string[];
}

export const getUserPreference = async (userId: string, appId: string = "default"): Promise<UserPreferencesDTO> => {
    try {
        const query: Record<string, string> = { userId };
        if (appId !== "default") {
            query.appId = appId;
        }

        const preference = await UserPreference.findOne(query);
        if (preference) {
            return {
                userId: preference.userId,
                notificationsEnabled: preference.notificationsEnabled ?? true,
                channels: {
                    inApp: preference.channels?.inApp ?? true,
                    email: preference.channels?.email ?? true,
                    push: preference.channels?.push ?? true
                },
                mutedSources: preference.mutedSources || [],
                mutedTypes: preference.mutedTypes || [],
            };
        }
    } catch (err) {
        console.warn("Could not query UserPreference (DB may be offline):", err);
    }

    return {
        userId,
        notificationsEnabled: true,
        channels: {
            inApp: true,
            email: true,
            push: true
        },
        mutedSources: [],
        mutedTypes: [],
    };
};

export const updateUserPreference = async (
    userId: string,
    updates: Partial<Omit<UserPreferencesDTO, "userId">>,
    appId: string = "default"
): Promise<UserPreferencesDTO> => {
    const filter: Record<string, string> = { userId };
    if (appId !== "default") {
        filter.appId = appId;
    }

    const updated = await UserPreference.findOneAndUpdate(
        filter,
        { $set: updates, $setOnInsert: { appId } },
        { returnDocument: "after", upsert: true }
    );


    return {
        userId: updated.userId,
        notificationsEnabled: updated.notificationsEnabled,
        channels: {
            inApp: updated.channels?.inApp ?? true,
            email: updated.channels?.email ?? true,
            push: updated.channels?.push ?? true
        },
        mutedSources: updated.mutedSources || [],
        mutedTypes: updated.mutedTypes || [],
    };
};

export const areNotificationEnabled = async (userId: string): Promise<boolean> => {
    const pref = await getUserPreference(userId);
    return pref.notificationsEnabled;
};