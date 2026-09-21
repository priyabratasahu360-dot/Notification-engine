import { Router } from "express";
import {
    getPreferences,
    setPreferences,
} from "../controllers/preferenceController.js";

const router = Router();

router.get("/:userId", getPreferences);
router.put("/:userId", setPreferences);

export default router;
