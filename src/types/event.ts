export type NotificationEvent = {
    eventId: string,
    type: string,
    source: string,
    senderId?: string,
    recipientId?: string,
    data: Record<string, unknown>,
    timestamp: string
}