export type NotificationEvent = {
    eventId: string,
    type: string,
    senderId: string,
    recipientId: string,
    data: Record<string, unknown>
}