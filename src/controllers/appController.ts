import type { Request, Response } from "express";
import { registerApp } from "../services/appService.js";

// POST /api/apps/register
// Allows any third-party developer/client to register their application and receive API credentials
export const handleRegisterApp = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({
                error: "INVALID_REQUEST",
                message: "A valid 'name' field is required to register an application.",
            });
        }

        const app = await registerApp(name.trim(), description);

        return res.status(201).json({
            message: "Application registered successfully! Keep your apiKey secure.",
            appId: app.appId,
            name: app.name,
            apiKey: app.apiKey,
        });
    } catch (error) {
        console.error("Error registering application:", error);
        return res.status(500).json({
            error: "REGISTRATION_FAILED",
            message: "Failed to register application. Please try again later.",
        });
    }
};
