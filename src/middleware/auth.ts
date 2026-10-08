import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

/**
 * Generates an HMAC-SHA256 signature for a given userId using the shared service key.
 * Third-party backends can use this exact logic to generate tokens for their authenticated users.
 */
export function generateUserToken(userId: string, secretKey?: string): string {
    const secret = secretKey || process.env.INTERNAL_SERVICE_KEY;
    if (!secret) {
        throw new Error("INTERNAL_SERVICE_KEY is not defined in environment");
    }
    return crypto.createHmac("sha256", secret).update(userId).digest("hex");
}

/**
 * Validates whether the given userToken matches the HMAC-SHA256 of the userId.
 * Uses timingSafeEqual to prevent timing attacks.
 */
export function verifyUserToken(userId: string, token: string, secretKey?: string): boolean {
    const secret = secretKey || process.env.INTERNAL_SERVICE_KEY;
    if (!secret || !userId || !token) {
        return false;
    }

    try {
        const expected = crypto.createHmac("sha256", secret).update(userId).digest("hex");
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
 *   - 'x-user-id': The ID of the authenticated user
 *   - 'x-user-token': The HMAC-SHA256 signature of the user ID generated with the secret key
 *
 * Attaches verified userId to `req.userId`.
 */
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
    const userIdHeader = req.headers["x-user-id"];
    const userTokenHeader = req.headers["x-user-token"];

    const userId = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;
    const token = Array.isArray(userTokenHeader) ? userTokenHeader[0] : userTokenHeader;

    if (!userId || !token) {
        return res.status(401).json({
            error: "UNAUTHORIZED",
            message: "Missing 'x-user-id' or 'x-user-token' authentication headers.",
        });
    }

    const isValid = verifyUserToken(userId, token);
    if (!isValid) {
        return res.status(403).json({
            error: "FORBIDDEN",
            message: "Invalid 'x-user-token' for the provided 'x-user-id'. Access denied.",
        });
    }

    // Attach verified user ID to request
    (req as any).userId = userId;
    next();
}
