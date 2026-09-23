import {WebSocket, WebSocketServer} from "ws";
import type { Server } from "http";

const clients = new Map<string, Set<WebSocket>>();

export function sendNotification(
    userId: string,
    notification: unknown
){
    const userSockets = clients.get(userId);

    if(!userSockets || userSockets.size === 0){
        console.log(`User ${userId} is not connected`);
        return;
    }

    const payload = JSON.stringify(notification);
    let activeSentCount = 0;

    for (const socket of userSockets) {
        if(socket.readyState === WebSocket.OPEN){
            socket.send(payload);
            activeSentCount++;
        }
    }

    if (activeSentCount === 0) {
        console.log(`WebSocket connections for ${userId} were not open`);
    }
}

export function createWebsocketServer(server: Server){
    const wss = new WebSocketServer({
        server
    });

    wss.on("connection", (socket, request) => {
        console.log("Websocket client connected");

        const url = new URL(
            request.url || "",
            `http://${request.headers.host}`
        );

        const userId = url.searchParams.get('userId');

        if(!userId){
            socket.close();
            return;
        }

        // Support multiple tabs/devices per user
        if (!clients.has(userId)) {
            clients.set(userId, new Set<WebSocket>());
        }
        clients.get(userId)!.add(socket);
        console.log(`User connected: ${userId} (active sockets: ${clients.get(userId)!.size})`);

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
    });

    return wss;
}