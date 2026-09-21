import mongoose from "mongoose";
import "dotenv/config";

const url = process.env.MONGO_URI || "";

let isConnected = false;

export const connectDb = async () => {
    if (!url) {
        console.warn("⚠️ MONGO_URI is not set in .env. MongoDB features will run in offline mode.");
        return;
    }
    try {
        await mongoose.connect(url, {
            serverSelectionTimeoutMS: 4000,
        });
        isConnected = true;
        console.log("✅ MongoDB connected successfully");
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️ Warning: MongoDB connection error (${msg}). Engine will proceed with in-memory/real-time dispatch.`);
    }
};

export const isDbConnected = () => isConnected;