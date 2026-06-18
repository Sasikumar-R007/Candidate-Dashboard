import "dotenv/config";
import { cert, getApps, initializeApp } from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase env vars");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const token = process.argv[2];
if (!token) {
  console.error("Usage: npx tsx server/scripts/test-push-send.ts <fcm-token>");
  process.exit(1);
}

const messageId = await getMessaging().send({
  token,
  notification: { title: "StaffOS Test", body: "If you see this popup, push works." },
  webpush: {
    notification: { title: "StaffOS Test", body: "If you see this popup, push works." },
  },
});

console.log("FCM sent:", messageId);
