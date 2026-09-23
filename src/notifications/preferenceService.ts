import { UserPreference } from "../models/userPreferenceSchema.js";
import type { NotificationChannel } from "./notificationsIntent.js";

export interface UserPreferencesDTO {
    userId: string;
    notificationsEnabled: boolean;
    channels: {
        inApp: boolean;
        email: boolean;
    };
    mutedSources: string[];
    mutedTypes: string[];
}

export const getUserPreference = async (userId: string): Promise<UserPreferencesDTO> => {
    try {
        const preference = await UserPreference.findOne({ userId });
        if (preference) {
            return {
                userId: preference.userId,
                notificationsEnabled: preference.notificationsEnabled ?? true,
                channels: {
                    inApp: preference.channels?.inApp ?? true,
                    email: preference.channels?.email ?? true,
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
        },
        mutedSources: [],
        mutedTypes: [],
    };
};

export const updateUserPreference = async (
    userId: string,
    updates: Partial<Omit<UserPreferencesDTO, "userId">>
): Promise<UserPreferencesDTO> => {
    const updated = await UserPreference.findOneAndUpdate(
        { userId },
        { $set: updates },
        { returnDocument: "after", upsert: true }
    );

    return {
        userId: updated.userId,
        notificationsEnabled: updated.notificationsEnabled,
        channels: {
            inApp: updated.channels?.inApp ?? true,
            email: updated.channels?.email ?? true,
        },
        mutedSources: updated.mutedSources || [],
        mutedTypes: updated.mutedTypes || [],
    };
};

export const areNotificationEnabled = async (userId: string): Promise<boolean> => {
    const pref = await getUserPreference(userId);
    return pref.notificationsEnabled;
};