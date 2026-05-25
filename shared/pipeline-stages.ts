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
