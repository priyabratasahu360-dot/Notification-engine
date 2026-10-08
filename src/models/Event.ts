import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    appId: {
      type: String,
      default: "default",
      index: true,
    },

    eventId: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      required: true,
      index: true,
    },

    timestamp: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

// Compound unique index for multi-tenant deduplication
eventSchema.index({ appId: 1, source: 1, eventId: 1 }, { unique: true });

export const Event = mongoose.model("Event", eventSchema);