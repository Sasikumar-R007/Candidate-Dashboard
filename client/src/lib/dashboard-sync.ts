import { useEffect, useRef } from "react";
import type { QueryClient, QueryKey } from "@tanstack/react-query";

// Cross-tab sync utility for the Recruiter (TA) dashboard.
//
// The "Source Resume" page is opened in a new browser tab, which means its
// React Query cache is completely isolated from the dashboard tab. Calling
// `queryClient.invalidateQueries` there will NOT refresh the dashboard's
// Applicant Overview. To bridge the two tabs we use the BroadcastChannel API,
// with a `localStorage` fallback for browsers/contexts where BroadcastChannel
// is unavailable (e.g. some older Safari versions).

export type DashboardSyncEventType =
  | "applications:changed"
  | "candidates:changed"
  | "requirements:changed";

export interface DashboardSyncEvent {
  type: DashboardSyncEventType;
  // Optional payload for finer-grained handling in the future.
  source?: string;
  timestamp?: number;
}

const CHANNEL_NAME = "staffos-dashboard-sync";
const STORAGE_KEY = "__staffos_dashboard_sync__";

type Listener = (event: DashboardSyncEvent) => void;

const listeners = new Set<Listener>();
let broadcastChannel: BroadcastChannel | null = null;
let storageHandlerInstalled = false;

function ensureBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (broadcastChannel) return broadcastChannel;
  if (typeof BroadcastChannel === "undefined") return null;

  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    broadcastChannel.onmessage = (msg: MessageEvent<DashboardSyncEvent>) => {
      if (msg?.data?.type) {
        listeners.forEach((l) => l(msg.data));
      }
    };
  } catch {
    broadcastChannel = null;
  }
  return broadcastChannel;
}

function ensureStorageFallback() {
  if (typeof window === "undefined" || storageHandlerInstalled) return;
  storageHandlerInstalled = true;
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    try {
      const parsed: DashboardSyncEvent = JSON.parse(e.newValue);
      if (parsed?.type) {
        listeners.forEach((l) => l(parsed));
      }
    } catch {
      // ignore malformed payloads
    }
  });
}

export function broadcastDashboardEvent(event: DashboardSyncEvent): void {
  if (typeof window === "undefined") return;

  const payload: DashboardSyncEvent = {
    timestamp: Date.now(),
    ...event,
  };

  // 1) Primary: BroadcastChannel reaches all same-origin tabs instantly.
  const channel = ensureBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage(payload);
    } catch {
      // ignore
    }
  }

  // 2) Fallback: localStorage `storage` event fires in OTHER tabs.
  // We write a unique value so identical consecutive events still trigger.
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // Cleanup so we don't pollute storage (also lets the next event fire even
    // if it has the same shape).
    window.setTimeout(() => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }, 0);
  } catch {
    // localStorage may be unavailable (private mode, etc.) — silently ignore.
  }
}

/**
 * Subscribe to dashboard sync events fired from other tabs (or the same tab).
 * Returns an unsubscribe function.
 */
export function subscribeToDashboardEvents(listener: Listener): () => void {
  ensureBroadcastChannel();
  ensureStorageFallback();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Hook that invalidates the given React Query keys whenever a matching sync
 * event arrives from any tab. Keep the `eventTypes` and `queryKeys` arrays
 * stable (memoize at the call site) — the hook intentionally only re-binds
 * when the QueryClient changes.
 */
export function useDashboardSync(
  queryClient: QueryClient,
  options: {
    eventTypes: DashboardSyncEventType[];
    queryKeys: QueryKey[];
  },
): void {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const unsubscribe = subscribeToDashboardEvents((event) => {
      const { eventTypes, queryKeys } = optionsRef.current;
      if (!eventTypes.includes(event.type)) return;
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
        queryClient.refetchQueries({ queryKey: key });
      });
    });
    return unsubscribe;
  }, [queryClient]);
}
