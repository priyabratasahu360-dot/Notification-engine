import { WebSocket, WebSocketServer } from "ws";
import type { Server } from "http";
import { verifyUserToken } from "../middleware/auth.js";

const clients = new Map<string, Set<WebSocket>>();

export function isUserConnected(userId: string): boolean {
    const userSockets = clients.get(userId);

    if (!userSockets || userSockets.size === 0) {
        return false;
    }

    // Check open connection
    for (const socket of userSockets) {
        if (socket.readyState === WebSocket.OPEN) {
            return true;
        }
    }

    return false;
}

export function sendNotification(
    userId: string,
    notification: unknown
) {
    const userSockets = clients.get(userId);

    if (!userSockets || userSockets.size === 0) {
        console.log(`User ${userId} is not connected`);
        return;
    }

    const payload = JSON.stringify(notification);
    let activeSentCount = 0;

    for (const socket of userSockets) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(payload);
            activeSentCount++;
        }
    }

    if (activeSentCount === 0) {
        console.log(`WebSocket connections for ${userId} were not open`);
    }
}

export function createWebsocketServer(server: Server) {
    const wss = new WebSocketServer({
        server
    });

    wss.on("connection", async (socket, request) => {
        const url = new URL(
            request.url || "",
            `http://${request.headers.host}`
        );

        const appId = url.searchParams.get("appId");
        const userId = url.searchParams.get("userId");
        const token = url.searchParams.get("token");

        // Validate user identity and token signature
        if (!userId || !token) {
            console.warn("[WebSocket] Rejected connection: Missing userId or token");
            socket.close(4401, "Missing authentication credentials");
            return;
        }

        let secretKey = process.env.INTERNAL_SERVICE_KEY || "";
        if (appId) {
            const { getAppById } = await import("../services/appService.js");
            const app = await getAppById(appId);
            if (!app) {
                console.warn(`[WebSocket] Rejected connection: Unknown appId=${appId}`);
                socket.close(4401, "Invalid appId");
                return;
            }
            secretKey = app.apiKey;
        }

        if (!secretKey) {
            socket.close(4500, "Server configuration error");
            return;
        }

        const isValid = verifyUserToken(userId, token, secretKey);
        if (!isValid) {
            console.warn(`[WebSocket] Rejected connection: Invalid token for userId=${userId}`);
            socket.close(4403, "Invalid user token");
            return;
        }

        // Support multiple tabs/devices per user
        if (!clients.has(userId)) {
            clients.set(userId, new Set<WebSocket>());
        }
        clients.get(userId)!.add(socket);
        console.log(`User connected via WebSocket: ${userId} [App: ${appId || "default"}] (active sockets: ${clients.get(userId)!.size})`);



        socket.on("close", () => {
            const userSockets = clients.get(userId);
            if (userSockets) {
                userSockets.delete(socket);
                if (userSockets.size === 0) {
                    clients.delete(userId);
                    console.log(`User disconnected completely: ${userId}`);
                } else {
                    console.log(`User closed 1 connection: ${userId} (${userSockets.size} remaining)`);
                }
            }
        });

        socket.on("error", (error) => {
            console.error(`Websocket error for user ${userId}:`, error);
        })
    });

    return wss;
}