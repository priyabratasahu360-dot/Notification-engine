import { sendNotification } from "../lib/websocketServer.js";
import { Notification } from "../models/Notification.js";
import type { NotificationEvent } from "../types/event.js";

export const processEvent = async(event: NotificationEvent) => {
    switch(event.type){
        case "message.created":
            try{
                const notification = await Notification.create({
                    eventId: event.eventId,
                    recipientId: event.recipientId,
                    senderId: event.senderId,
                    type: "message",
                    title: "New message",
                    message: "You received a new message",
                    data: event.data
                });

                console.log(`Notification created for event: ${event.eventId}`);

                sendNotification(event.recipientId, notification);
            }
            catch(error: any){
                if(error.code === 11000){
                    console.log(`Event already processed: ${event.eventId}`);
                    return;
                }
                throw error;
            }
        break;

        default:
            console.log(`Unknown event type: ${event.type}`);
    }
}