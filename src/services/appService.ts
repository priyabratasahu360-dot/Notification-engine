import crypto from "crypto";
import { App, type IApp } from "../models/App.js";

/**
 * Generates a cryptographically secure random API key and appId
 */
export function generateAppCredentials() {
    const appId = `app_${crypto.randomBytes(6).toString("hex")}`;
    const apiKey = `ne_live_${crypto.randomBytes(24).toString("hex")}`;
    return { appId, apiKey };
}

/**
 * Registers a new client application and generates credentials
 */
export async function registerApp(name: string, description?: string): Promise<IApp> {
    const { appId, apiKey } = generateAppCredentials();

    const app = await App.create({
        appId,
        name,
        apiKey,
        description: description || "",
    });

    return app;
}

/**
 * Looks up and validates an app by its secret API key directly from MongoDB
 */
export async function getAppByApiKey(apiKey: string): Promise<IApp | null> {
    if (!apiKey) return null;
    return await App.findOne({ apiKey });
}

/**
 * Looks up and validates an app by its public appId directly from MongoDB
 */
export async function getAppById(appId: string): Promise<IApp | null> {
    if (!appId) return null;
    return await App.findOne({ appId });
}
