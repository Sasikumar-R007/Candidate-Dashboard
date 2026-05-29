import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  invalidateOperationalQueries,
  OPERATIONAL_SYNC_INTERVAL_MS,
} from "@/lib/query-config";

/**
 * Keeps pipeline, nudges, closures, and related views fresh while the tab is visible.
 * Does not reload the page — only refetches active React Query caches in the background.
 */
export function OperationalDataSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const sync = () => {
      if (document.visibilityState !== "visible") return;
      void invalidateOperationalQueries(queryClient, { refetchType: "active" });
    };

    const intervalId = window.setInterval(sync, OPERATIONAL_SYNC_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        sync();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [queryClient]);

  return null;
}
