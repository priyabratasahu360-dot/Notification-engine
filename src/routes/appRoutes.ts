import { Router } from "express";
import { handleRegisterApp } from "../controllers/appController.js";

const router = Router();

// Public endpoint for third-party developers to register their application
router.post("/register", handleRegisterApp);

export default router;
