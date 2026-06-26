export type PipelineStageKey =
  | "resumeReview"
  | "screening"
  | "shortlisted"
  | "level1"
  | "level2"
  | "level3"
  | "hrRound"
  | "finalRound"
  | "offerStage"
  | "closure"
  | "rejected";

export const FULL_PIPELINE_STAGES: ReadonlyArray<{
  key: PipelineStageKey;
  display: string;
}> = [
  { key: "resumeReview", display: "Resume Review" },
  { key: "shortlisted", display: "Shortlisted" },
  { key: "screening", display: "Screening" },
  { key: "level1", display: "Level 1" },
  { key: "level2", display: "Level 2" },
  { key: "level3", display: "Level 3" },
  { key: "hrRound", display: "HR Round" },
  { key: "finalRound", display: "Final Round" },
  { key: "offerStage", display: "Offer Stage" },
  { key: "closure", display: "Closure" },
  { key: "rejected", display: "Rejected" },
] as const;

export const FULL_PIPELINE_STAGE_ORDER: readonly PipelineStageKey[] =
  FULL_PIPELINE_STAGES.map((s) => s.key);

const DISPLAY_BY_KEY = Object.fromEntries(
  FULL_PIPELINE_STAGES.map((s) => [s.key, s.display]),
) as Record<PipelineStageKey, string>;

export function normalizePipelineDisplayStatus(
  rawStatus: string | null | undefined,
): string {
  const key = resolvePipelineStageKey(rawStatus);
  return DISPLAY_BY_KEY[key] ?? "Resume Review";
}

/** Withdrawn, screened out, client-rejected, and other terminal outcomes. */
export function isTerminalRejectedStatus(
  rawStatus?: string | null,
  statusNote?: string | null,
): boolean {
  const lower = (rawStatus || "").trim().toLowerCase();
  const note = statusNote || "";

  if (
    note.includes("[[TERMINAL:WITHDRAW]]") ||
    note.includes("[[TERMINAL:CLIENT_REJECT]]") ||
    /\[\[REJECT_STAGE:/.test(note) ||
    /^rejected by client:/im.test(note)
  ) {
    return true;
  }

  return (
    lower.includes("reject") ||
    lower.includes("screened out") ||
    lower === "withdrawn" ||
    lower === "offer drop" ||
    lower === "declined"
  );
}

/** Effective kanban column label from raw application status + status note. */
export function resolvePipelineGroupingStatus(
  rawStatus?: string | null,
  statusNote?: string | null,
): string {
  if (isTerminalRejectedStatus(rawStatus, statusNote)) {
    return DISPLAY_BY_KEY.rejected;
  }
  return normalizePipelineDisplayStatus(rawStatus);
}

export function resolvePipelineStageKey(
  rawStatus: string | null | undefined,
): PipelineStageKey {
  const status = (rawStatus || "").trim();
  const lower = status.toLowerCase().replace(/\s+/g, " ");

  if (!status || lower === "archived") {
    return "resumeReview";
  }

  if (
    lower.includes("reject") ||
    lower.includes("screened out") ||
    lower === "withdrawn" ||
    lower === "offer drop" ||
    lower === "declined"
  ) {
    return "rejected";
  }

  if (
    lower === "resume review" ||
    lower === "in process" ||
    lower === "in-process" ||
    lower === "evaluating" ||
    lower === "applied" ||
    lower === "sourced" ||
    lower === "reviewed" ||
    lower === "submitted"
  ) {
    return "resumeReview";
  }

  if (
    lower === "screening" ||
    lower === "intro call" ||
    lower === "assignment"
  ) {
    return "screening";
  }

  if (lower === "shortlisted") {
    return "shortlisted";
  }

  if (lower === "l1" || lower === "level 1" || lower === "interview scheduled") {
    return "level1";
  }

  if (lower === "l2" || lower === "level 2") {
    return "level2";
  }

  if (lower === "l3" || lower === "level 3") {
    return "level3";
  }

  if (lower === "hr round" || lower === "hr") {
    return "hrRound";
  }

  if (lower.includes("final round") || lower === "final") {
    return "finalRound";
  }

  if (lower === "offer stage" || lower === "selected") {
    return "offerStage";
  }

  if (
    lower === "closure" ||
    lower === "joined" ||
    lower === "hired"
  ) {
    return "closure";
  }

  return "resumeReview";
}

export function groupCandidatesByPipelineStage<
  T extends { currentStatus?: string | null; status?: string | null },
>(
  candidates: T[],
  options?: { excludeArchived?: boolean },
): Record<PipelineStageKey, T[]> {
  const grouped = Object.fromEntries(
    FULL_PIPELINE_STAGE_ORDER.map((key) => [key, [] as T[]]),
  ) as Record<PipelineStageKey, T[]>;

  for (const candidate of candidates) {
    const status = candidate.currentStatus ?? candidate.status ?? "";
    if (options?.excludeArchived !== false) {
      const lower = String(status).trim().toLowerCase();
      if (lower === "archived") continue;
    }
    const stageKey = resolvePipelineStageKey(String(status));
    grouped[stageKey].push(candidate);
  }

  return grouped;
}

export function createEmptyPipelineStageGroups<
  T,
>(): Record<PipelineStageKey, T[]> {
  return Object.fromEntries(
    FULL_PIPELINE_STAGE_ORDER.map((key) => [key, [] as T[]]),
  ) as Record<PipelineStageKey, T[]>;
}

export function parseClosureMeta(statusNote?: string | null) {
  const note = statusNote || "";
  const atMatch = note.match(/\[\[CLOSURE_AT:([^\]]+)\]\]/);
  return { closureAt: atMatch ? atMatch[1] : null };
}

const CLOSURE_GRACE_MS = 24 * 60 * 60 * 1000;

/** Shared 24h grace before terminal pipeline outcomes move to archive. */
export const PIPELINE_TERMINAL_GRACE_MS = CLOSURE_GRACE_MS;

export function parseRejectedMeta(statusNote?: string | null) {
  const note = statusNote || "";
  const stageMatch = note.match(/\[\[REJECT_STAGE:([^\]]+)\]\]/);
  const atMatch = note.match(/\[\[REJECTED_AT:([^\]]+)\]\]/);
  return {
    rejectedFromStage: stageMatch ? stageMatch[1] : null,
    rejectedAt: atMatch ? atMatch[1] : null,
  };
}

export function resolveTerminalAtIso(
  statusNote?: string | null,
  updatedAt?: string | Date | null,
): string | null {
  const { rejectedAt } = parseRejectedMeta(statusNote);
  if (rejectedAt) return rejectedAt;
  if (!updatedAt) return null;
  const parsed = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function isArchivedPipelineStatus(status?: string | null): boolean {
  return (status || "").trim().toLowerCase() === "archived";
}

export function isClosurePipelineStatus(status?: string | null): boolean {
  return (status || "").trim().toLowerCase() === "closure";
}

export function isPastTerminalGracePeriod(
  status?: string | null,
  statusNote?: string | null,
  updatedAt?: string | Date | null,
): boolean {
  if (isArchivedPipelineStatus(status)) return false;

  if (isClosurePipelineStatus(status)) {
    const { closureAt } = parseClosureMeta(statusNote);
    const tsSource = closureAt || updatedAt;
    if (!tsSource) return false;
    const ts = new Date(tsSource).getTime();
    return !Number.isNaN(ts) && Date.now() - ts >= PIPELINE_TERMINAL_GRACE_MS;
  }

  if (!isTerminalRejectedStatus(status, statusNote)) return false;
  const at = resolveTerminalAtIso(statusNote, updatedAt);
  if (!at) return false;
  const ts = new Date(at).getTime();
  return !Number.isNaN(ts) && Date.now() - ts >= PIPELINE_TERMINAL_GRACE_MS;
}

export function isWithinTerminalGracePeriod(
  status?: string | null,
  statusNote?: string | null,
  updatedAt?: string | Date | null,
): boolean {
  if (isArchivedPipelineStatus(status)) return false;
  if (isClosurePipelineStatus(status)) {
    return !isPastTerminalGracePeriod(status, statusNote, updatedAt);
  }
  if (!isTerminalRejectedStatus(status, statusNote)) return false;
  return !isPastTerminalGracePeriod(status, statusNote, updatedAt);
}

export function shouldIncludeInEmployeeArchive(
  status?: string | null,
  statusNote?: string | null,
  updatedAt?: string | Date | null,
): boolean {
  if (isArchivedPipelineStatus(status)) return true;
  return isPastTerminalGracePeriod(status, statusNote, updatedAt);
}

export function shouldExcludeFromEmployeePipeline(
  status?: string | null,
  statusNote?: string | null,
  updatedAt?: string | Date | null,
): boolean {
  if (isArchivedPipelineStatus(status)) return true;
  return isPastTerminalGracePeriod(status, statusNote, updatedAt);
}

export function shouldShowInCandidatePipeline(
  status?: string | null,
  statusNote?: string | null,
  updatedAt?: string | Date | null,
): boolean {
  if (isArchivedPipelineStatus(status)) return false;
  if (isTerminalRejectedStatus(status, statusNote)) {
    return isWithinTerminalGracePeriod(status, statusNote, updatedAt);
  }
  return true;
}

export function shouldShowInCandidateArchive(
  status?: string | null,
  statusNote?: string | null,
  updatedAt?: string | Date | null,
): boolean {
  if (isArchivedPipelineStatus(status)) return true;
  if (isTerminalRejectedStatus(status, statusNote)) {
    return isPastTerminalGracePeriod(status, statusNote, updatedAt);
  }
  return false;
}

export function shouldAutoArchiveApplication(app: {
  status?: string | null;
  statusNote?: string | null;
  updatedAt?: string | Date | null;
  appliedDate?: string | Date | null;
}): boolean {
  const updatedAt = app.updatedAt ?? app.appliedDate ?? null;
  if (isArchivedPipelineStatus(app.status)) return false;
  return isPastTerminalGracePeriod(app.status, app.statusNote, updatedAt);
}

export function appendRejectedTimestampNote(
  existingNote?: string | null,
  fromStage?: string | null,
): string {
  let result = (existingNote || "").trim();
  if (fromStage && !/\[\[REJECT_STAGE:/.test(result)) {
    const stageStamp = `[[REJECT_STAGE:${fromStage}]]`;
    result = result ? `${result}\n${stageStamp}` : stageStamp;
  }
  if (!/\[\[REJECTED_AT:/.test(result)) {
    const atStamp = `[[REJECTED_AT:${new Date().toISOString()}]]`;
    result = result ? `${result}\n${atStamp}` : atStamp;
  }
  return result;
}

/** Closure records stay visible on TA views for 24h before archiving. */
export function isWithinClosureGracePeriod(
  status?: string | null,
  statusNote?: string | null,
  updatedAt?: string | Date | null,
): boolean {
  if ((status || "").trim().toLowerCase() !== "closure") return false;
  const { closureAt } = parseClosureMeta(statusNote);
  const tsSource = closureAt || updatedAt;
  if (!tsSource) return true;
  const ts = new Date(tsSource).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts < CLOSURE_GRACE_MS;
}

export function appendClosureTimestampNote(existingNote?: string | null): string {
  const base = (existingNote || "").trim();
  if (base.includes("[[CLOSURE_AT:")) return base;
  const stamp = `[[CLOSURE_AT:${new Date().toISOString()}]]`;
  return base ? `${base}\n\n${stamp}` : stamp;
}
