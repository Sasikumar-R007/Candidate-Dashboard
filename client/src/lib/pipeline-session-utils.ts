import type { CandidateCommentsSessionApplicant } from "@/components/dashboard/candidate-comments-session";

/** Real job-application IDs only (excludes TL resume-submission pseudo IDs). */
export function isPipelineApplicationSessionId(id: string | null | undefined): boolean {
  return Boolean(id) && !String(id).startsWith("submission-");
}

export const RECRUITER_PIPELINE_STAGE_ORDER = [
  "level1",
  "level2",
  "level3",
  "hrRound",
  "finalRound",
  "offerStage",
  "closure",
] as const;

export const ADMIN_PIPELINE_STAGE_ORDER = [
  "shortlisted",
  "screening",
  "level1",
  "level2",
  "level3",
  "hrRound",
  "finalRound",
  "offerStage",
  "closure",
] as const;

export const TL_PIPELINE_STAGE_ORDER = [
  "L1",
  "L2",
  "L3",
  "HR Round",
  "Final Round",
  "Offer Stage",
  "Closure",
] as const;

export const CLIENT_PIPELINE_STAGE_ORDER = [
  "L1",
  "L2",
  "L3",
  "HR Round",
  "Final Round",
  "Offer Stage",
  "Closure",
  "Rejected",
] as const;

export function getPipelineStageBadgeClass(status: string): string {
  const s = (status || "").toLowerCase().trim();
  if (s === "l1" || s.includes("level 1")) return "bg-emerald-500 text-white";
  if (s === "l2" || s.includes("level 2")) return "bg-teal-500 text-white";
  if (s === "l3" || s.includes("level 3")) return "bg-cyan-600 text-white";
  if (s.includes("final")) return "bg-violet-500 text-white";
  if (s.includes("hr")) return "bg-indigo-500 text-white";
  if (s.includes("offer") && !s.includes("drop")) return "bg-amber-500 text-white";
  if (s.includes("closure") || s === "joined") return "bg-green-600 text-white";
  if (s.includes("shortlist")) return "bg-lime-500 text-white";
  if (s.includes("screen") || s.includes("resume review") || s.includes("evaluating")) {
    return "bg-sky-500 text-white";
  }
  if (s.includes("reject") || s.includes("screened out")) return "bg-red-500 text-white";
  return "bg-blue-600 text-white";
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
    company: candidate.company,
    currentStatus: statusOverride ?? candidate.currentStatus,
    email: candidate.email,
    phone: candidate.phone,
    location: candidate.location,
    experience: candidate.experience,
    skills: candidate.skills,
    resumeFile: candidate.resumeFile,
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
    skills: candidate.skills,
    resumeFile: candidate.resumeFile,
  };
}
