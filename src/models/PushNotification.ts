import {Schema} from "mongoose";

export interface IPushSubscription {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const pushSubscriptionSchema = new Schema<IPushSubscription>({
    endpoint: {
        type: String,
        required: true
    },
    expirationTime: {
        type: Number,
        default: null
    },
    keys: {
        p256dh:{
            type: String,
            required: true
        },
        auth: {
            type: String,
            required: true
        }
    }
}, {_id: false});