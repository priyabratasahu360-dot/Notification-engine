import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { getAppById, getAppByApiKey } from "../services/appService.js";

/**
 * Validates whether the given userToken matches the HMAC-SHA256 of the userId
 * using the provided secretKey. Uses timingSafeEqual to prevent timing attacks.
 */
export function verifyUserToken(userId: string, token: string, secretKey: string): boolean {
    if (!secretKey || !userId || !token) {
        return false;
    }

    try {
        const expected = crypto.createHmac("sha256", secretKey).update(userId).digest("hex");
        const tokenBuffer = Buffer.from(token, "hex");
        const expectedBuffer = Buffer.from(expected, "hex");

        if (tokenBuffer.length !== expectedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
    } catch {
        return false;
    }
}

/**
 * Express middleware to authenticate client requests.
 * Expects:
 *   - 'x-app-id': (Optional if single-tenant) The unique ID of the application
 *   - 'x-user-id': The ID of the authenticated user
 *   - 'x-user-token': The HMAC-SHA256 signature generated with the app's secret key
 *
 * Attaches verified userId and appId to `req.userId` and `req.appId`.
 */
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
    const appIdHeader = req.headers["x-app-id"];
    const userIdHeader = req.headers["x-user-id"];
    const userTokenHeader = req.headers["x-user-token"];

    const appId = Array.isArray(appIdHeader) ? appIdHeader[0] : appIdHeader;
    const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
    const token = Array.isArray(userTokenHeader) ? userTokenHeader[0] : userTokenHeader;

    if (!userId || !token) {
        return res.status(401).json({
            error: "UNAUTHORIZED",
            message: "Missing 'x-user-id' or 'x-user-token' authentication headers.",
        });
    }

    let secretKey = process.env.INTERNAL_SERVICE_KEY || "";
    let resolvedAppId = "default";

    // If appId is provided, look up the tenant app in DB
    if (appId) {
        const app = await getAppById(appId);
        if (!app) {
            return res.status(401).json({
                error: "INVALID_APP",
                message: `Application with appId '${appId}' does not exist.`,
            });
        }
        secretKey = app.apiKey;
        resolvedAppId = app.appId;
    }

    if (!secretKey) {
        return res.status(500).json({
            error: "SERVER_CONFIG_ERROR",
            message: "No secret key configured for authentication verification.",
        });
    }

    const isValid = verifyUserToken(userId, token, secretKey);
    if (!isValid) {
        return res.status(403).json({
            error: "FORBIDDEN",
            message: "Invalid 'x-user-token' for the provided user and application.",
        });
    }

    // Attach verified user and app context to request
    (req as any).userId = userId;
    (req as any).appId = resolvedAppId;
    next();
}

