import {WebSocket, WebSocketServer} from "ws";
import type { Server } from "http";

const clients = new Map<string, WebSocket>();

export function sendNotification(
    userId: string,
    notification: unknown
){
    const socket = clients.get(userId);

    if(!socket){
        console.log(`User ${userId} is not connected`);
        return;
    }

    if(socket.readyState !== WebSocket.OPEN){
        console.log(`WebSocket for ${userId} is not open`);
        return;
    }

    socket.send(JSON.stringify(notification));
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

        clients.set(userId, socket);
        console.log(`User connected: ${userId}`);

        socket.on("close", () => {
            clients.delete(userId);
            console.log(`User disconneted: ${userId}`)
        })
    })

    return wss;
}