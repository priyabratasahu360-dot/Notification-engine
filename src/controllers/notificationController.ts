import type { Request, Response } from "express";
import { Notification } from "../models/Notification.js";

// GET /api/notifications?userId=123&read=false
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const { userId, read, limit = "50" } = req.query;

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "userId query parameter is required" });
        }

        const query: Record<string, unknown> = { recipientId: userId };
        if (typeof read === "string") {
            query.read = read === "true";
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit as string, 10) || 50);

        const unreadCount = await Notification.countDocuments({
            recipientId: userId,
            read: false,
        });
        res.json({
            userId,
            unreadCount,
            count: notifications.length,
            notifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { $set: { read: true } },
            { returnDocument: "after" }
        );

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.json({ message: "Marked as read", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Failed to update notification" });
    }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "userId is required in body" });
        }

        const result = await Notification.updateMany(
            { recipientId: userId, read: false },
            { $set: { read: true } }
        );

        res.json({
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ error: "Failed to mark all as read" });
    }
};
