import type { Request, Response } from "express";
import {
    getUserPreference,
    updateUserPreference,
} from "../notifications/preferenceService.js";

// GET /api/preferences
// Fetches preferences for the authenticated user
export const getPreferences = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const appId = (req as any).appId || "default";
        const preferences = await getUserPreference(userId, appId);
        res.json(preferences);
    } catch (error) {
        console.error("Error fetching preferences:", error);
        res.status(500).json({ error: "Failed to fetch user preferences" });
    }
};

// PUT /api/preferences
// Updates preferences for the authenticated user
export const setPreferences = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const appId = (req as any).appId || "default";
        const updates = req.body;

        const updated = await updateUserPreference(userId, updates, appId);
        res.json({
            message: "Preferences updated successfully",
            preferences: updated,
        });

    } catch (error) {
        console.error("Error updating preferences:", error);
        res.status(500).json({ error: "Failed to update user preferences" });
    }
};

