import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    eventId: string;
    source: string;
    recipientId: string;
    senderId?: string | null | undefined;
    title: string;
    type: string;
    message: string;
    channel: string;
    data: Record<string, unknown>;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema(
    {
        eventId: {
            type: String,
            required: true,
            index: true,
        },
        source: {
            type: String,
            required: true,
        },
        recipientId: {
            type: String,
            required: true,
            index: true,
        },
        senderId: {
            type: String,
            default: null,
        },
        title: {
            type: String,
            required: true,
        },
        type: { 
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        channel: {
            type: String,
            enum: ["in_app", "email", "sms"],
            default: "in_app",
        },
        data: {
            type: Schema.Types.Mixed,
            default: {},
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);