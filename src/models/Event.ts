import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      required: true,
    },

    timestamp: {
      type: String,
      required: true,
    }
  },
  {timestamps: true}
);

export const Event = mongoose.model("Event", eventSchema);