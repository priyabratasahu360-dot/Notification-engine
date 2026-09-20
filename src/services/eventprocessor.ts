import { sendNotification } from "../lib/websocketServer.js";
import { Notification } from "../models/Notification.js";
import type { NotificationEvent } from "../types/event.js";

export const processEvent = async(event: NotificationEvent) => {
    switch(event.type){
        case "message.created":
            try{
                console.log("event received")
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