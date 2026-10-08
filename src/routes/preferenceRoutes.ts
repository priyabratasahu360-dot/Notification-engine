import { Router } from "express";
import {
    getPreferences,
    setPreferences,
} from "../controllers/preferenceController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = Router();

// Secure all preference routes with user authentication
router.use(authenticateUser);

router.get("/", getPreferences);
router.put("/", setPreferences);

export default router;

