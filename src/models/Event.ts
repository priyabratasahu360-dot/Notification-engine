import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
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

// Compound unique index for multi-tenant / multi-service deduplication
eventSchema.index({ source: 1, eventId: 1 }, { unique: true });

export const Event = mongoose.model("Event", eventSchema);