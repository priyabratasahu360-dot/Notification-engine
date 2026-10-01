import webpush from "web-push";

const vapidSubject = process.env.VAPID_SUBJECT;
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if(!vapidSubject || !vapidPublicKey || !vapidPrivateKey){
    throw new Error("Missing web push VAPID env variables");
}

webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
);

export default webpush;