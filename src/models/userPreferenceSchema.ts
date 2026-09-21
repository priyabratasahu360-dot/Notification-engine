import mongoose, { Schema, Document } from "mongoose";

export interface IUserPreference extends Document {
  userId: string;
  notificationsEnabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
  };
  mutedSources: string[];
  mutedTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userPreferenceSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
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

export const UserPreference = mongoose.model<IUserPreference>(
  "UserPreference",
  userPreferenceSchema
);