import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateOperationalQueries } from "@/lib/query-config";

/**
 * Refetches operational data only when the user returns to the tab after it was hidden.
 * No background interval — mutations and explicit user actions drive other refreshes.
 */
export function OperationalDataSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void invalidateOperationalQueries(queryClient, { refetchType: "active" });
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [queryClient]);

  return null;
}
