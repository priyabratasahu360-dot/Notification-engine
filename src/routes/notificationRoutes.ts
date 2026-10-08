import { Router } from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "../controllers/notificationController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = Router();

// Secure all notification routes with user authentication
router.use(authenticateUser);

router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;

