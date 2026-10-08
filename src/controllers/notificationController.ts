import type { Request, Response } from "express";
import { Notification } from "../models/Notification.js";

// GET /api/notifications?read=false&limit=50
// Uses authenticated req.userId and req.appId from middleware
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const appId = (req as any).appId || "default";
        const { read, limit = "50" } = req.query;

        const query: Record<string, unknown> = { recipientId: userId };
        if (appId !== "default") {
            query.appId = appId;
        }

        if (typeof read === "string") {
            query.read = read === "true";
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit as string, 10) || 50);

        const countQuery: Record<string, unknown> = { recipientId: userId, read: false };
        if (appId !== "default") {
            countQuery.appId = appId;
        }

        const unreadCount = await Notification.countDocuments(countQuery);

        res.json({
            appId,
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
// Ensures notification belongs to the authenticated user before marking as read
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id as string, recipientId: userId },
            { $set: { read: true } },
            { new: true }
        );


        if (!notification) {
            return res.status(404).json({ error: "Notification not found or access denied" });
        }

        res.json({ message: "Marked as read", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ error: "Failed to update notification" });
    }
};

// PATCH /api/notifications/read-all
// Marks all notifications for the authenticated user as read
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

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

