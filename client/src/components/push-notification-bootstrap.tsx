import { useCallback, useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { messagingPromise } from "@/lib/firebase";
import { dispatchOpenCommentSession } from "@/lib/open-comment-session";
import { Bell, X } from "lucide-react";

const SW_URL = "/firebase-messaging-sw.js";

function logPushSetup(message: string, detail?: unknown) {
  if (import.meta.env.DEV) {
    console.info("[push]", message, detail ?? "");
  }
}

function isNotificationGranted(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

async function savePushTokenOnly(): Promise<"saved" | "unsupported" | "no-token"> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    logPushSetup("skipped: browser does not support notifications or service workers");
    return "unsupported";
  }

  if (!isNotificationGranted()) {
    logPushSetup("skipped: notification permission is not granted", Notification.permission);
    return "unsupported";
  }

  try {
    await navigator.serviceWorker.register(SW_URL);
    const registration = await navigator.serviceWorker.ready;
    const messaging = await messagingPromise;
    if (!messaging) {
      logPushSetup("skipped: Firebase messaging is not supported in this browser");
      return "unsupported";
    }

    const vapidKey = (import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined)?.trim();
    if (!vapidKey) {
      logPushSetup("skipped: VITE_FIREBASE_VAPID_KEY is missing in client/.env");
      return "unsupported";
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      logPushSetup("skipped: no FCM token returned");
      return "no-token";
    }

    logPushSetup("registering token with backend");
    await apiRequest("POST", "/api/save-push-token", { token });
    logPushSetup("token saved successfully");
    return "saved";
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[push] setup failed:", error);
    }
    return "no-token";
  }
}

export default function PushNotificationBootstrap() {
  const { user, isLoading } = useAuth();
  const [promptState, setPromptState] = useState<"hidden" | "default" | "denied" | "enabling">("hidden");

  const syncPromptFromPermission = useCallback(() => {
    if (!("Notification" in window)) {
      setPromptState("hidden");
      return;
    }
    const permission = Notification.permission;
    if (permission === "granted") {
      setPromptState("hidden");
      return;
    }
    if (permission === "denied") {
      setPromptState("denied");
      return;
    }
    setPromptState("default");
  }, []);

  const tryRegister = useCallback(async () => {
    if (isNotificationGranted()) {
      const result = await savePushTokenOnly();
      if (result === "saved" || result === "unsupported" || result === "no-token") {
        setPromptState("hidden");
      }
      return;
    }
    syncPromptFromPermission();
  }, [syncPromptFromPermission]);

  useEffect(() => {
    if (isLoading || !user) {
      setPromptState("hidden");
      return;
    }
    void tryRegister();
  }, [isLoading, user?.data?.id, tryRegister]);

  // FCM does not show OS notifications when the tab is focused — handle foreground messages here.
  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    void messagingPromise.then((messaging) => {
      if (!messaging) {
        return;
      }
      unsubscribe = onMessage(messaging, (payload) => {
        if (Notification.permission !== "granted") {
          return;
        }
        const title = payload.notification?.title || "StaffOS Notification";
        const body = payload.notification?.body || "";
        const applicationId = payload.data?.applicationId;
        logPushSetup("foreground message received", { title, body, applicationId });
        const notification = new Notification(title, {
          body,
          icon: "/favicon.ico",
          data: payload.data,
        });
        notification.onclick = () => {
          window.focus();
          notification.close();
          if (applicationId && payload.data?.type === "application_comment") {
            dispatchOpenCommentSession(applicationId);
          }
        };
      });
    });

    return () => {
      unsubscribe?.();
    };
  }, [isLoading, user?.data?.id]);

  // Background push click → open comment session when app is already open.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    const onSwMessage = (event: MessageEvent) => {
      if (event.data?.type !== "staffos-open-comment-session") {
        return;
      }
      const applicationId = event.data.applicationId;
      if (applicationId && event.data.notificationType === "application_comment") {
        dispatchOpenCommentSession(applicationId);
      }
    };
    navigator.serviceWorker.addEventListener("message", onSwMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onSwMessage);
  }, []);

  const handleEnableClick = () => {
    if (!("Notification" in window)) {
      return;
    }

    logPushSetup("enable clicked", {
      permission: Notification.permission,
      origin: window.location.origin,
    });

    // Must call requestPermission immediately on click — before setState/await — or Chrome may return "default".
    const permissionPromise: Promise<NotificationPermission> =
      Notification.permission === "granted"
        ? Promise.resolve("granted")
        : Notification.requestPermission();

    void permissionPromise.then(async (result) => {
      const effective = Notification.permission;
      logPushSetup("permission after prompt", { result, effective, origin: window.location.origin });

      if (effective !== "granted" && result !== "granted") {
        logPushSetup("skipped: notification permission not granted", effective);
        setPromptState(effective === "denied" ? "denied" : "default");
        return;
      }

      setPromptState("enabling");
      const saveResult = await savePushTokenOnly();
      if (saveResult === "saved") {
        setPromptState("hidden");
        return;
      }
      setPromptState("default");
    });
  };

  if (isLoading || !user || promptState === "hidden") {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[300] max-w-sm rounded-lg border border-slate-200 bg-white p-4 shadow-lg"
      role="status"
    >
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">
            {promptState === "enabling" ? "Enabling notifications…" : "Enable desktop notifications"}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {promptState === "enabling"
              ? "Saving your device token…"
              : promptState === "denied"
                ? "Notifications are blocked. Allow this site in browser settings, then refresh."
                : "Get alerts for comments and requirement updates."}
          </p>
          {promptState === "default" && (
            <button
              type="button"
              onClick={handleEnableClick}
              className="mt-3 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Enable notifications
            </button>
          )}
        </div>
        {promptState !== "enabling" && (
          <button
            type="button"
            onClick={() => setPromptState("hidden")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
