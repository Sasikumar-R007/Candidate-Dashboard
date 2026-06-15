import type { QueryClient, QueryKey } from "@tanstack/react-query";

/** Default cache lifetime for inactive queries (ms). */
export const DEFAULT_QUERY_GC_MS = 10 * 60_000;

/** Default stale time — queries are not refetched while fresh (ms). */
export const DEFAULT_QUERY_STALE_MS = 5 * 60_000;

/**
 * Query presets — use with useQuery({ ...queryPresets.live, queryKey: [...] }).
 * Data refreshes on mount, user actions, and mutation invalidation — not on a timer.
 */
export const queryPresets = {
  /** Pipeline, nudges, closures, live lists */
  live: {
    staleTime: DEFAULT_QUERY_STALE_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  /** Requirements, dashboards, assignments */
  standard: {
    staleTime: DEFAULT_QUERY_STALE_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  /** Rarely changing reference data */
  static: {
    staleTime: DEFAULT_QUERY_STALE_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
} as const;

const OPERATIONAL_QUERY_ROOTS = [
  "/api/admin/pipeline",
  "/api/admin/closures-list",
  "/api/admin/requirements",
  "/api/admin/archived-requirements",
  "/api/admin/client-jds",
  "/api/admin/candidates",
  "/api/admin/deliveries",
  "/api/admin/daily-metrics",
  "/api/admin/notifications",
  "/api/admin/notifications-feed",
  "/api/admin/dashboard",
  "/api/admin/impact-metrics",
  "/api/team-leader/pipeline",
  "/api/team-leader/pipeline-counts",
  "/api/team-leader/closures",
  "/api/team-leader/requirements",
  "/api/team-leader/stats",
  "/api/team-leader/target-metrics",
  "/api/team-leader/team-performance",
  "/api/recruiter/pipeline",
  "/api/recruiter/closure-reports",
  "/api/recruiter/requirements",
  "/api/recruiter/applications",
  "/api/recruiter/daily-metrics",
  "/api/recruiter/performance-summary",
  "/api/client/pipeline",
  "/api/client/closures",
  "/api/client/requirements",
  "/api/client/dashboard-stats",
  "/api/client/drop-rates",
  "/api/client/speed-metrics",
  "/api/nudges",
  "/api/candidate/nudges",
  "/api/employee/notifications-feed",
  "/api/chat",
] as const;

const OPERATIONAL_SUBSTRINGS = [
  "pipeline",
  "nudges",
  "closures",
  "closure",
  "notifications",
  "deliveries",
  "applications",
] as const;

function queryKeyRoot(queryKey: QueryKey): string | null {
  const first = queryKey[0];
  return typeof first === "string" ? first : null;
}

export function isOperationalQueryKey(queryKey: QueryKey): boolean {
  const root = queryKeyRoot(queryKey);
  if (!root) return false;

  if (OPERATIONAL_QUERY_ROOTS.some((prefix) => root === prefix || root.startsWith(`${prefix}/`))) {
    return true;
  }

  const lower = root.toLowerCase();
  return OPERATIONAL_SUBSTRINGS.some((token) => lower.includes(token));
}

let operationalInvalidateTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Marks operational queries stale and refetches active ones (no full page reload).
 */
export async function invalidateOperationalQueries(
  queryClient: QueryClient,
  options?: { refetchType?: "active" | "all" | "none" },
) {
  await queryClient.invalidateQueries({
    predicate: (query) => isOperationalQueryKey(query.queryKey),
    refetchType: options?.refetchType ?? "active",
  });
}

/** Debounced invalidation after mutations to avoid request storms. */
export function scheduleOperationalInvalidation(
  queryClient: QueryClient,
  options?: { refetchType?: "active" | "all" | "none" },
) {
  if (operationalInvalidateTimer) {
    clearTimeout(operationalInvalidateTimer);
  }
  operationalInvalidateTimer = setTimeout(() => {
    operationalInvalidateTimer = null;
    void invalidateOperationalQueries(queryClient, options);
  }, 400);
}
