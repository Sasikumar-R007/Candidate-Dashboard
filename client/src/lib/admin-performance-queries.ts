import type { QueryClient } from "@tanstack/react-query";
import { invalidateOperationalQueries } from "@/lib/query-config";

/** Refresh admin dashboards after revenue / target data changes. */
export function invalidateAdminPerformanceQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["/api/admin/revenue-mappings"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/revenue-mapping-closure-candidates"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/target-mappings"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/team-performance"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/closures-list"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/revenue-analysis"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/performance-metrics"] });
  queryClient.invalidateQueries({ queryKey: ["/api/admin/monthly-performance"] });
}

/** Propagate revenue mapping changes to Admin, TL, TA, and Client views. */
export function invalidateRevenueMappingQueries(queryClient: QueryClient) {
  invalidateAdminPerformanceQueries(queryClient);

  queryClient.invalidateQueries({ queryKey: ["/api/team-leader/team-performance"] });
  queryClient.invalidateQueries({ queryKey: ["/api/team-leader/closures"] });
  queryClient.invalidateQueries({ queryKey: ["/api/team-leader/stats"] });
  queryClient.invalidateQueries({ queryKey: ["/api/team-leader/target-metrics"] });
  queryClient.invalidateQueries({ queryKey: ["/api/team-leader/aggregated-targets"] });
  queryClient.invalidateQueries({ queryKey: ["/api/team-leader/profile"] });
  queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === "string" &&
      query.queryKey[0].startsWith("/api/team-leader/team-performance-graph"),
  });

  queryClient.invalidateQueries({ queryKey: ["/api/recruiter/closure-reports"] });
  queryClient.invalidateQueries({ queryKey: ["/api/recruiter/quarterly-performance"] });
  queryClient.invalidateQueries({ queryKey: ["/api/recruiter/performance-summary"] });
  queryClient.invalidateQueries({ queryKey: ["/api/recruiter/aggregated-targets"] });
  queryClient.invalidateQueries({ queryKey: ["/api/recruiter/target-metrics"] });
  queryClient.invalidateQueries({ queryKey: ["/api/recruiter/profile"] });

  queryClient.invalidateQueries({ queryKey: ["/api/client/closures"] });
  queryClient.invalidateQueries({ queryKey: ["/api/client/speed-metrics"] });
  void invalidateOperationalQueries(queryClient, { refetchType: "active" });
}
