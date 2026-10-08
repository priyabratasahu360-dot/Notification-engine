import mongoose, { Schema, Document } from "mongoose";

export interface IApp extends Document {
    appId: string;
    name: string;
    apiKey: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const appSchema = new Schema(
    {
        appId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        apiKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        description: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

export const App = mongoose.model<IApp>("App", appSchema);
