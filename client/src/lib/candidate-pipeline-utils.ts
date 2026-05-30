/** Maps application status to candidate pipeline column (Applied Jobs kanban). */
export function mapCandidateApplicationStage(status: string | null | undefined): string {
  if (!status) return "Applied";
  const s = status.toLowerCase();
  if (s.includes("archived") || s.includes("withdrawn")) return "Archived";
  if (s.includes("applied") || s.includes("new") || s.includes("process")) return "Applied";
  if (s === "l1" || s === "l2" || s.includes("review")) return "In-Review";
  if (s.includes("interview") || s === "l3" || s.includes("scheduled") || s.includes("final")) {
    return "Interview Stage";
  }
  if (s.includes("hr")) return "HR Round";
  if (s.includes("offer")) return "Offer";
  if (s.includes("reject") || s.includes("screened") || s.includes("out")) return "Screened Out";
  return "Applied";
}

export function isCandidateRejectedStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  if (s.includes("withdrawn")) return false;
  return mapCandidateApplicationStage(status) === "Screened Out";
}

export function formatTatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0";
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const totalHours = Math.round(totalMinutes / 60);
  if (totalHours < 48) return `${totalHours}h`;
  const totalDays = Math.round(totalHours / 24);
  return `${totalDays}d`;
}

export type NudgeTatInput = {
  createdAt?: string | Date | null;
  respondedAt?: string | Date | null;
  isResponded?: boolean;
};

export function computeCandidateNudgeTat(nudges: NudgeTatInput[]): {
  display: string;
  respondedCount: number;
  averageMs: number | null;
} {
  const responded = nudges.filter(
    (n) => n.isResponded && n.respondedAt && n.createdAt,
  );

  if (responded.length === 0) {
    return { display: "0", respondedCount: 0, averageMs: null };
  }

  const totalMs = responded.reduce((sum, n) => {
    const start = new Date(n.createdAt as string | Date).getTime();
    const end = new Date(n.respondedAt as string | Date).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return sum;
    return sum + (end - start);
  }, 0);

  const averageMs = totalMs / responded.length;
  const avgLabel = formatTatDuration(averageMs);

  return {
    display: responded.length === 1 ? avgLabel : `${responded.length} · ${avgLabel}`,
    respondedCount: responded.length,
    averageMs,
  };
}

export const CANDIDATE_TAT_METRIC_TOOLTIP =
  "Average time for the hiring team to respond after you send a nudge. Shown as 0 until at least one nudge receives an update.";
