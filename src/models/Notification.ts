import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
    eventId: {
        type: String,
        required: true,
        unique: true
    },
    recipientId: {
        type: String,
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    //which type of notification i.e: friend request || message 
    type: { 
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    //different notifications need different extra information.
    data: {
        type: Schema.Types.Mixed,
        default: {}
    },
    read: {
        type: Boolean,
        default: false
    }
});

export const Notification = mongoose.model("Notification", notificationSchema);