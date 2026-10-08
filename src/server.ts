import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";

dotenv.config();

import { connectDb } from "./db/db.js";
import { createWebsocketServer } from "./lib/websocketServer.js";
import { processEvent } from "./services/eventprocessor.js";
import { ingestEvent } from "./events/eventIngestion.js";
import { registerEvent, unregisterEvent } from "./events/eventDeduplication.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import preferenceRoutes from "./routes/preferenceRoutes.js";
import appRoutes from "./routes/appRoutes.js";
import { getAppByApiKey } from "./services/appService.js";

const app = express();
app.use(express.json());

// Enable CORS for client applications (browsers / mobile frontends)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-app-id, x-user-id, x-user-token");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});


const PORT = process.env.PORT || 5001;
const server = createServer(app);

// Initialize WebSocket server
createWebsocketServer(server);

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// REST API Routes
app.use("/api/apps", appRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/preferences", preferenceRoutes);

// Core Event Ingestion Endpoint
app.post("/event", async (req, res) => {
    // 0. Producer Authentication via API Key
    const incomingKey = (req.headers["x-api-key"] || req.headers["x-service-key"]) as string | undefined;
    const configuredServiceKey = process.env.INTERNAL_SERVICE_KEY;
    let resolvedAppId = (req.headers["x-app-id"] as string) || "default";

    console.log(`[POST /event] Received request from ${req.ip} | Headers:`, {
        "content-type": req.headers["content-type"],
        "x-api-key": incomingKey ? "PRESENT" : "MISSING",
        "x-app-id": req.headers["x-app-id"] || "NONE",
    });
    console.log(`[POST /event] Payload body:`, JSON.stringify(req.body));

    if (!incomingKey) {
        return res.status(401).json({
            status: "error",
            message: "Unauthorized: Missing 'x-api-key' header",
        });
    }

    // Check registered apps in MongoDB
    const registeredApp = await getAppByApiKey(incomingKey);
    if (registeredApp) {
        resolvedAppId = registeredApp.appId;
    } else if (configuredServiceKey && incomingKey === configuredServiceKey) {
        resolvedAppId = (req.headers["x-app-id"] as string) || "default";
    } else {
        console.warn("[POST /event] Rejected: Invalid x-api-key");
        return res.status(401).json({
            status: "error",
            message: "Unauthorized: Invalid x-api-key header",
        });
    }



    let parsedEvent: ReturnType<typeof ingestEvent> | null = null;
    let registered = false;

    try {
        console.log("[POST /event] Step 1: Validating schema...");
        const event = ingestEvent(req.body);
        parsedEvent = event;
        console.log(`[POST /event] Step 1 passed: eventId=${event.eventId}, type=${event.type}, recipientId=${event.recipientId}`);

        // 2. Deduplicate event (prevents reprocessing duplicate events based on source + eventId)
        let isNewEvent = true;
        try {
            console.log("[POST /event] Step 2: Checking deduplication in DB...");
            isNewEvent = await registerEvent(event);
            if (isNewEvent) {
                registered = true;
            }
        } catch (dbErr) {
            console.warn("Deduplication DB check skipped or error:", dbErr);
        }

        if (!isNewEvent) {
            console.log(`[POST /event] Duplicate event ignored: ${event.eventId}`);
            return res.status(200).json({
                status: "ignored",
                message: "duplicate event ignored",
                eventId: event.eventId,
            });
        }

        // 3. Process Event: Handler mapping -> Decision Engine -> Multi-Channel Dispatch
        console.log("[POST /event] Step 3: Processing event through handlers and decision engine...");
        const result = await processEvent(event);

        if (!result.success) {
            console.log(`[POST /event] Event filtered: ${result.reason}`);
            return res.status(200).json({
                status: "filtered",
                message: result.reason || "Event processed but no notification was dispatched",
                eventId: event.eventId,
            });
        }

        console.log(`[POST /event] Event ${event.eventId} successfully delivered via:`, result.dispatch?.deliveredChannels);

        return res.status(202).json({
            status: "accepted",
            message: "event processed and dispatched successfully",
            eventId: event.eventId,
            dispatch: result.dispatch,
        });
    } catch (error: any) {
        // If registration succeeded but processing crashed, unregister so producer can retry safely
        if (registered && parsedEvent) {
            try {
                await unregisterEvent(parsedEvent.source, parsedEvent.eventId);
                console.warn(`Rolled back event registration for ${parsedEvent.source}:${parsedEvent.eventId} due to processing failure`);
            } catch (rollbackErr) {
                console.error("Failed to rollback event registration:", rollbackErr);
            }
        }

        console.error("Error processing event:", error);
        const errMsg = error?.message || "Failed to process event";
        return res.status(400).json({
            error: "INVALID_EVENT",
            message: errMsg,
        });
    }
});

// starting server
async function startServer() {
    await connectDb();

    server.listen(PORT, () => {
        console.log(`Notification Engine running on port ${PORT}`);
        console.log(`WebSocket ready on ws://localhost:${PORT}?userId=<id>&token=<token>`);
    });

}

startServer();