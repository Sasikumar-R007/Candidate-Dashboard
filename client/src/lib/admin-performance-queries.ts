import type { QueryClient } from "@tanstack/react-query";

/** Refresh admin dashboards after revenue / target data changes. */
export function invalidateAdminPerformanceQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["/api/admin/revenue-mappings"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/target-mappings"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/team-performance"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/closures-list"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/revenue-analysis"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/performance-metrics"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/monthly-performance"] });
}
