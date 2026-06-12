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

export function getApplicationNudgeDisplayState(
  applicationId: string,
  inCooldown: boolean,
  candidateNudges: Array<{
    applicationId?: string;
    isResponded?: boolean;
    message?: string | null;
    createdAt?: string | Date | null;
  }>,
): { showIcon: boolean; shouldPulse: boolean; hasUpdate: boolean } {
  const appNudges = candidateNudges
    .filter((n) => n.applicationId === applicationId)
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
    );
  const latestNudge = appNudges[0];
  const latestHasUpdate = Boolean(
    latestNudge && (latestNudge.isResponded || latestNudge.message),
  );

  // Icon only during cooldown: pulse if awaiting response, static if update received.
  // No icon when cooldown is over (ready to nudge again).
  if (!inCooldown) {
    return { showIcon: false, shouldPulse: false, hasUpdate: latestHasUpdate };
  }

  return {
    showIcon: true,
    shouldPulse: !latestHasUpdate,
    hasUpdate: latestHasUpdate,
  };
}

/** Relative time: minutes (<1h), hours (<24h), days (<7d), then calendar date. */
export function formatJobAppliedDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";
  const applied = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(applied.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - applied.getTime();
  if (diffMs < 0) return formatJobAppliedCalendarDate(applied);

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  return formatJobAppliedCalendarDate(applied);
}

function formatJobAppliedCalendarDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  return `${day}-${month}`;
}

/** Full date for archive table (e.g. 29-May-2026). */
export function formatArchiveTerminalDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "—";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "—";
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function getArchiveStatusLabel(
  status: string | null | undefined,
  statusNote?: string | null,
): { label: string; isRed: boolean } {
  const note = statusNote || "";
  const lower = (status || "").trim().toLowerCase();

  if (note.includes("[[TERMINAL:WITHDRAW]]") || lower === "withdrawn") {
    return { label: "Withdrawn", isRed: true };
  }
  if (lower === "archived") {
    return { label: "Archived", isRed: false };
  }
  if (
    lower.includes("reject") ||
    lower.includes("screened") ||
    lower.includes("out")
  ) {
    return { label: "Screened Out", isRed: true };
  }
  return { label: status || "Screened Out", isRed: true };
}

export function getArchiveTerminalMeta(
  status: string | null | undefined,
  statusNote?: string | null,
): { date: string; stage: string } {
  const note = statusNote || "";
  const stageMatch = note.match(/\[\[REJECT_STAGE:([^\]]+)\]\]/);
  const atMatch = note.match(/\[\[REJECTED_AT:([^\]]+)\]\]/);

  const date = atMatch?.[1]
    ? formatArchiveTerminalDate(atMatch[1])
    : "—";

  const stage =
    stageMatch?.[1] ||
    (status && status !== "Withdrawn" && status !== "Archived" ? status : "—");

  return { date, stage };
}

export const PIPELINE_COLUMN_STYLES: Record<
  string,
  { topBorder: string; columnBg: string; countBadge: string }
> = {
  Applied: {
    topBorder: "border-t-4 border-t-[#EAB308]",
    columnBg: "bg-[#F1F5F9]",
    countBadge: "bg-white text-gray-600 border border-gray-200",
  },
  "In-Review": {
    topBorder: "border-t-4 border-t-[#F97316]",
    columnBg: "bg-[#F1F5F9]",
    countBadge: "bg-white text-gray-600 border border-gray-200",
  },
  "Interview Stage": {
    topBorder: "border-t-4 border-t-[#22C55E]",
    columnBg: "bg-[#F1F5F9]",
    countBadge: "bg-white text-gray-600 border border-gray-200",
  },
  "HR Round": {
    topBorder: "border-t-4 border-t-[#14B8A6]",
    columnBg: "bg-[#F1F5F9]",
    countBadge: "bg-white text-gray-600 border border-gray-200",
  },
  Offer: {
    topBorder: "border-t-4 border-t-[#A855F7]",
    columnBg: "bg-[#F1F5F9]",
    countBadge: "bg-white text-gray-600 border border-gray-200",
  },
  "Screened Out": {
    topBorder: "border-t-4 border-t-[#EF4444]",
    columnBg: "bg-[#F1F5F9]",
    countBadge: "bg-white text-gray-600 border border-gray-200",
  },
};
