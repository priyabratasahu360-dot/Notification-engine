import type { NotificationIntent } from "../notifications/notificationsIntent.js";
import type { NotificationEvent } from "../types/event.js";

export type EventHandler = (event: NotificationEvent) => Promise<NotificationIntent | null>;