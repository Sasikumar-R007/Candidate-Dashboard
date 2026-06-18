import { cert, getApps, initializeApp } from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";

let initialized = false;

function initializeFirebaseAdmin() {
  if (initialized || getApps().length > 0) {
    initialized = true;
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("[push] Firebase Admin env vars missing — push send disabled");
    return;
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
  initialized = true;
}

export async function sendPushNotification({
  token,
  title,
  body,
  data,
}: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  initializeFirebaseAdmin();
  if (getApps().length === 0) {
    return;
  }

  try {
    const messageId = await getMessaging().send({
      token,
      notification: {
        title,
        body,
      },
      data: data ?? {},
      webpush: {
        notification: {
          title,
          body,
          icon: "/favicon.ico",
        },
        fcmOptions: {
          link: process.env.FRONTEND_URL || "http://localhost:5000",
        },
      },
    });
    if (process.env.NODE_ENV !== "production") {
      console.info("[push] FCM sent:", messageId);
    }
  } catch (error) {
    console.error("[push] FCM send failed:", error);
    throw error;
  }
}
