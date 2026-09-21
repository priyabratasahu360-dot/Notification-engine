import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import { connectDb } from "./db/db.js";
import { createWebsocketServer } from "./lib/websocketServer.js";
import { processEvent } from "./services/eventprocessor.js";
import { ingestEvent } from "./events/eventIngestion.js";
import { registerEvent } from "./events/eventDeduplication.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import preferenceRoutes from "./routes/preferenceRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Enable CORS for testing from browsers/external apps
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Serve test UI directly from root directory
const rootDir = path.resolve(__dirname, "..");
app.use(express.static(rootDir));

const PORT = process.env.PORT || 5000;
const server = createServer(app);

// Initialize WebSocket server
createWebsocketServer(server);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// REST API Routes
app.use("/api/notifications", notificationRoutes);
app.use("/api/preferences", preferenceRoutes);

// Core Event Ingestion Endpoint
app.post("/event", async (req, res) => {
    try {
        // 1. Ingest & Validate event schema
        const event = ingestEvent(req.body);

        // 2. Deduplicate event (prevents reprocessing duplicate events)
        let isNewEvent = true;
        try {
            isNewEvent = await registerEvent(event);
        } catch (dbErr) {
            console.warn("Deduplication DB check skipped or error:", dbErr);
        }

        if (!isNewEvent) {
            return res.status(200).json({
                status: "ignored",
                message: "duplicate event ignored",
                eventId: event.eventId,
            });
        }

        // 3. Process Event: Handler mapping -> Decision Engine -> Multi-Channel Dispatch
        const result = await processEvent(event);

        if (!result.success) {
            return res.status(200).json({
                status: "filtered",
                message: result.reason || "Event processed but no notification was dispatched",
                eventId: event.eventId,
            });
        }

        console.log(`Event ${event.eventId} successfully delivered via:`, result.dispatch?.deliveredChannels);

        return res.status(202).json({
            status: "accepted",
            message: "event processed and dispatched successfully",
            eventId: event.eventId,
            dispatch: result.dispatch,
        });
    } catch (error: unknown) {
        console.error("Error processing event:", error);
        const errMsg = error instanceof Error ? error.message : "failed to process event";
        return res.status(400).json({
            status: "error",
            message: errMsg,
        });
    }
});

async function startServer() {
    await connectDb();

    server.listen(PORT, () => {
        console.log(`=========================================`);
        console.log(`🚀 Notification Engine running on port ${PORT}`);
        console.log(`📡 WebSocket ready on ws://localhost:${PORT}?userId=<id>`);
        console.log(`🎨 Test UI available at http://localhost:${PORT}/test.html`);
        console.log(`=========================================`);
    });
}

startServer();