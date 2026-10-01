import { UserPreference } from "../models/UserPreference.js";
import type { IPushSubscription } from "../models/PushNotification.js";

export const savePushSubscription = async(userId: string, subscription: IPushSubscription): Promise<void> => {
    await UserPreference.updateOne({userId}, {
        $pull: {
            pushSubscriptions: {
                endpoint: subscription.endpoint
            }
        }
    });

    await UserPreference.updateOne({userId}, {
        $push: {
            pushSubscriptions: subscription
        }
    }, {upsert: true})
}

export const removePushSubscription = async(userId: string, endpoint: string): Promise<void> => {
    await UserPreference.updateOne({userId}, {
        $pull: {
            pushSubscriptions: {endpoint}
        }
    })
}