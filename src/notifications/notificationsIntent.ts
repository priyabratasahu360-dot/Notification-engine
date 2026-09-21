export type NotificationChannel = "in_app" | "email" | "sms";

export type NotificationIntent = {
    eventId: string;
    recipientId: string;
    senderId?: string | undefined;
    title: string;
    message: string;
    type: string;
    source: string;
    channels?: NotificationChannel[] | undefined;
    data: Record<string, unknown>;
};