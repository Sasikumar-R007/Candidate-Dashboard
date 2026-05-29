import { useEffect, useRef } from "react";
import { isNotificationSoundEnabled, playNotificationSound, primeNotificationSound } from "@/lib/notification-sound";

/**
 * Plays a short beep when unread notification count increases (not on first mount).
 */
export function useNotificationSound(unreadCount: number, enabled = true) {
  const previousUnreadRef = useRef<number | null>(null);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    const onInteract = () => primeNotificationSound();
    document.addEventListener("click", onInteract, { once: true });
    document.addEventListener("keydown", onInteract, { once: true });
    return () => {
      document.removeEventListener("click", onInteract);
      document.removeEventListener("keydown", onInteract);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isNotificationSoundEnabled()) {
      previousUnreadRef.current = unreadCount;
      return;
    }

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousUnreadRef.current = unreadCount;
      return;
    }

    const previous = previousUnreadRef.current ?? 0;
    if (unreadCount > previous && unreadCount > 0 && document.visibilityState === "visible") {
      playNotificationSound();
    }

    previousUnreadRef.current = unreadCount;
  }, [unreadCount, enabled]);
}
