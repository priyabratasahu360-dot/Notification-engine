import type { Request, Response } from "express";
import {
    getUserPreference,
    updateUserPreference,
} from "../notifications/preferenceService.js";

// GET /api/preferences/:userId
export const getPreferences = async (req: Request, res: Response) => {
    try {
        const userIdParam = req.params.userId;
        const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
        if (!userId) {
            return res.status(400).json({ error: "userId parameter is required" });
        }

        const preferences = await getUserPreference(userId);
        res.json(preferences);
    } catch (error) {
        console.error("Error fetching preferences:", error);
        res.status(500).json({ error: "Failed to fetch user preferences" });
    }
};

// PUT /api/preferences/:userId
export const setPreferences = async (req: Request, res: Response) => {
    try {
        const userIdParam = req.params.userId;
        const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
        const updates = req.body;

        if (!userId) {
            return res.status(400).json({ error: "userId parameter is required" });
        }

        const updated = await updateUserPreference(userId, updates);
        res.json({
            message: "Preferences updated successfully",
            preferences: updated,
        });
    } catch (error) {
        console.error("Error updating preferences:", error);
        res.status(500).json({ error: "Failed to update user preferences" });
    }
};
