import type { CandidateCommentsSessionApplicant } from "@/components/dashboard/candidate-comments-session";
import {
  FULL_PIPELINE_STAGE_ORDER,
  groupCandidatesByPipelineStage,
  resolvePipelineStageKey,
  type PipelineStageKey,
} from "@shared/pipeline-stages";

export {
  FULL_PIPELINE_STAGES,
  FULL_PIPELINE_STAGE_ORDER,
  groupCandidatesByPipelineStage,
  normalizePipelineDisplayStatus,
  resolvePipelineStageKey,
  type PipelineStageKey,
} from "@shared/pipeline-stages";

/** @deprecated Use FULL_PIPELINE_STAGE_ORDER */
export const RECRUITER_PIPELINE_STAGE_ORDER = FULL_PIPELINE_STAGE_ORDER;
/** @deprecated Use FULL_PIPELINE_STAGE_ORDER */
export const ADMIN_PIPELINE_STAGE_ORDER = FULL_PIPELINE_STAGE_ORDER;
/** @deprecated Use FULL_PIPELINE_STAGE_ORDER */
export const TL_PIPELINE_STAGE_ORDER = FULL_PIPELINE_STAGE_ORDER;
/** @deprecated Use FULL_PIPELINE_STAGE_ORDER */
export const CLIENT_PIPELINE_STAGE_ORDER = FULL_PIPELINE_STAGE_ORDER;

/** Real job-application IDs only (excludes TL resume-submission pseudo IDs). */
export function isPipelineApplicationSessionId(id: string | null | undefined): boolean {
  return Boolean(id) && !String(id).startsWith("submission-");
}

export function parseRejectedMeta(statusNote?: string | null) {
  const note = statusNote || "";
  const stageMatch = note.match(/\[\[REJECT_STAGE:([^\]]+)\]\]/);
  const atMatch = note.match(/\[\[REJECTED_AT:([^\]]+)\]\]/);
  return {
    rejectedFromStage: stageMatch ? stageMatch[1] : null,
    rejectedAt: atMatch ? atMatch[1] : null,
  };
}

export type TerminalOutcomeKind = "withdraw" | "client_reject";

export type TerminalOutcome = {
  kind: TerminalOutcomeKind | null;
  hoverLabel: string | null;
  rejectedFromStage: string | null;
  rejectedAt: string | null;
  showInApplicantOverview: boolean;
};

/** Withdrawn / client-rejected applications shown in Applicant Overview as Screened Out. */
export function parseTerminalOutcome(
  status?: string | null,
  statusNote?: string | null,
): TerminalOutcome {
  const note = statusNote || "";
  const lower = (status || "").trim().toLowerCase();
  const meta = parseRejectedMeta(statusNote);

  if (note.includes("[[TERMINAL:WITHDRAW]]") || lower === "withdrawn") {
    return {
      kind: "withdraw",
      hoverLabel: "Candidate Withdraw",
      ...meta,
      showInApplicantOverview: true,
    };
  }

  if (
    note.includes("[[TERMINAL:CLIENT_REJECT]]") ||
    /^rejected by client:/im.test(note) ||
    (lower === "rejected" && /client/i.test(note))
  ) {
    return {
      kind: "client_reject",
      hoverLabel: "Rejected by Client",
      ...meta,
      showInApplicantOverview: true,
    };
  }

  return {
    kind: null,
    hoverLabel: null,
    rejectedFromStage: meta.rejectedFromStage,
    rejectedAt: meta.rejectedAt,
    showInApplicantOverview: false,
  };
}

const RECRUITER_APPLICANT_STATUS_MAP: Record<string, string> = {
  "In Process": "Resume Review",
  "In-Process": "Resume Review",
  Evaluating: "Resume Review",
  "Resume Review": "Resume Review",
  Screening: "Screening",
  Shortlisted: "Shortlisted",
  Rejected: "Screened Out",
  "Screened Out": "Screened Out",
  Withdrawn: "Screened Out",
  L1: "L1",
  L2: "L2",
  L3: "L3",
  "Final Round": "Final Round",
  "HR Round": "HR Round",
  Closure: "Closure",
  Selected: "Selected",
  "Interview Scheduled": "L1",
  Applied: "Resume Review",
};

export function mapRecruiterApplicantDisplayStatus(
  rawStatus?: string | null,
  statusNote?: string | null,
): string {
  const terminal = parseTerminalOutcome(rawStatus, statusNote);
  if (terminal.kind) return "Screened Out";
  const key = (rawStatus || "").trim();
  return RECRUITER_APPLICANT_STATUS_MAP[key] || key || "Resume Review";
}

export function groupApplicantsByPipelineStage<
  T extends { currentStatus?: string | null; status?: string | null },
>(applicants: T[]): Record<PipelineStageKey, T[]> {
  return groupCandidatesByPipelineStage(applicants, { excludeArchived: true });
}

export function getPipelineStageBadgeClass(status: string): string {
  const key = resolvePipelineStageKey(status);
  switch (key) {
    case "level1":
      return "bg-emerald-500 text-white";
    case "level2":
      return "bg-teal-500 text-white";
    case "level3":
      return "bg-cyan-600 text-white";
    case "finalRound":
      return "bg-violet-500 text-white";
    case "hrRound":
      return "bg-indigo-500 text-white";
    case "offerStage":
      return "bg-amber-500 text-white";
    case "closure":
      return "bg-green-600 text-white";
    case "shortlisted":
      return "bg-lime-500 text-white";
    case "screening":
    case "resumeReview":
      return "bg-sky-500 text-white";
    case "rejected":
      return "bg-red-500 text-white";
    default:
      return "bg-blue-600 text-white";
  }
}

export function buildPipelineSessionList(
  getByStage: Record<string, any[] | undefined>,
  stageOrder: readonly string[],
  mapCandidate: (candidate: any) => CandidateCommentsSessionApplicant,
): CandidateCommentsSessionApplicant[] {
  const list: CandidateCommentsSessionApplicant[] = [];
  for (const stageKey of stageOrder) {
    const candidates = getByStage[stageKey] || [];
    for (const c of candidates) {
      const mapped = mapCandidate(c);
      if (isPipelineApplicationSessionId(mapped.id)) {
        list.push(mapped);
      }
    }
  }
  return list;
}

export function mapRecruiterPipelineCandidate(
  candidate: any,
  statusOverride?: string,
): CandidateCommentsSessionApplicant {
  return {
    id: candidate.id,
    candidateName: candidate.candidateName,
    roleApplied: candidate.roleApplied,
    jobTitle: candidate.jobTitle,
    company: candidate.company || candidate.currentCompany,
    currentStatus: statusOverride ?? candidate.currentStatus,
    email: candidate.email,
    phone: candidate.phone,
    location: candidate.location,
    experience: candidate.experience,
    skills: candidate.skills,
    resumeFile: candidate.resumeFile,
    profilePicture: candidate.profilePicture ?? candidate.profile_picture ?? null,
  };
}

export function mapAdminPipelineCandidate(
  candidate: any,
  statusOverride?: string,
): CandidateCommentsSessionApplicant {
  return {
    id: candidate.id,
    candidateName: candidate.candidateName,
    roleApplied: candidate.roleApplied || candidate.jobTitle,
    jobTitle: candidate.jobTitle,
    company: candidate.company,
    currentStatus: statusOverride ?? candidate.currentStatus,
    email: candidate.email ?? candidate.candidateEmail,
    phone: candidate.phone ?? candidate.candidatePhone,
    location: candidate.location,
    experience: candidate.experience,
    skills: candidate.skills,
    resumeFile: candidate.resumeFile,
    profilePicture: candidate.profilePicture ?? candidate.profile_picture ?? null,
  };
}

export function mapTeamLeaderPipelineCandidate(candidate: any): CandidateCommentsSessionApplicant {
  return {
    id: candidate.id,
    candidateName: candidate.name || candidate.candidateName,
    roleApplied: candidate.position || candidate.roleApplied,
    jobTitle: candidate.position || candidate.jobTitle,
    company: candidate.company,
    currentStatus: candidate.currentStatus || candidate.status,
    email: candidate.email,
    phone: candidate.phone,
    location: candidate.location,
    experience: candidate.experience,
    skills: candidate.skills,
    resumeFile: candidate.resumeFile,
    profilePicture: candidate.profilePicture ?? candidate.profile_picture ?? null,
  };
}

export function mapClientPipelineCandidate(candidate: any): CandidateCommentsSessionApplicant {
  return {
    id: candidate.id,
    candidateName: candidate.candidateName,
    roleApplied: candidate.roleApplied || candidate.requirementPosition,
    jobTitle: candidate.jobTitle || candidate.roleApplied,
    company: candidate.company,
    currentStatus: candidate.currentStatus || candidate.status,
    email: candidate.email ?? candidate.candidateEmail,
    phone: candidate.phone ?? candidate.candidatePhone,
    location: candidate.location,
    experience: candidate.experience,
    profilePicture: candidate.profilePicture ?? candidate.profile_picture ?? null,
    skills: candidate.skills,
    resumeFile: candidate.resumeFile,
  };
}
