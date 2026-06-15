import { useEffect, useState } from "react";

/** Delays (ms) for prioritized dashboard API loading — critical first, then requirements → pipeline → closures. */
export const DASHBOARD_LOAD_DELAYS = {
  requirements: 300,
  pipeline: 600,
  closures: 900,
} as const;

/**
 * Gates secondary dashboard queries so profile/stats load first, reducing parallel API spikes.
 */
export function useStaggeredDashboardLoad() {
  const [requirementsReady, setRequirementsReady] = useState(false);
  const [pipelineReady, setPipelineReady] = useState(false);
  const [closuresReady, setClosuresReady] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(
      () => setRequirementsReady(true),
      DASHBOARD_LOAD_DELAYS.requirements,
    );
    const t2 = window.setTimeout(
      () => setPipelineReady(true),
      DASHBOARD_LOAD_DELAYS.pipeline,
    );
    const t3 = window.setTimeout(
      () => setClosuresReady(true),
      DASHBOARD_LOAD_DELAYS.closures,
    );
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  return { requirementsReady, pipelineReady, closuresReady };
}
