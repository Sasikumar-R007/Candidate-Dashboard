import { eq } from "drizzle-orm";
import { pushTokens } from "@shared/schema";
import { db } from "../db";
import { sendPushNotification } from "./pushNotifications";

/** Fire-and-forget push to all devices registered for a user. */
export function dispatchPushForUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
) {
  void (async () => {
    const tokens = await db.select().from(pushTokens).where(eq(pushTokens.userId, userId));
    if (tokens.length === 0) {
      return;
    }
    const results = await Promise.allSettled(
      tokens.map((entry) =>
        sendPushNotification({
          token: entry.token,
          title,
          body,
          data,
        }),
      ),
    );
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          "[push] token delivery failed:",
          tokens[index]?.token?.slice(0, 24),
          result.reason,
        );
      }
    });
  })().catch((error) => {
    console.error("Push dispatch failed:", error);
  });
}
