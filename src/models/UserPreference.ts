import mongoose, { Schema, Document } from "mongoose";
import { pushSubscriptionSchema, type IPushSubscription } from "./PushNotification.js";

export interface IUserPreference extends Document {
  appId?: string;
  userId: string;
  notificationsEnabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  pushSubscriptions:IPushSubscription[];
  mutedSources: string[];
  mutedTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userPreferenceSchema = new Schema(
  {
    appId: {
      type: String,
      default: "default",
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },

    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    channels: {
      inApp: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    pushSubscriptions: {
      type: [pushSubscriptionSchema],
      default: [],
    },
    mutedSources: {
      type: [String],
      default: [],
    },
    mutedTypes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Unique index per tenant app and user
userPreferenceSchema.index({ appId: 1, userId: 1 }, { unique: true });

export const UserPreference = mongoose.model<IUserPreference>(
  "UserPreference",
  userPreferenceSchema
);