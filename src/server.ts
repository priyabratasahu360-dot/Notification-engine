import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
dotenv.config();

import {connectDb} from "./db/db.js";
import { createWebsocketServer } from "./lib/websocketServer.js";
import { processEvent } from "./services/eventprocessor.js";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

const server = createServer(app);

createWebsocketServer(server);

app.post("/event", async(req, res) => {
    try{
      await processEvent(req.body);
      res.status(201).json({
        message: "event processed"
      })
    }
    catch(error){
      console.error("error processing event: ", error);
      res.status(500).json({
        message: "failed to process event"
      })
    }
})

async function startServer() {
  await connectDb();

  server.listen(PORT, () => {
    console.log(`Notification Engine running on port ${PORT}`);
  });
}

startServer();