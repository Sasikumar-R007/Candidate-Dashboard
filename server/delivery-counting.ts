import type {
  JobApplication,
  Requirement,
  RequirementAssignment,
  ResumeSubmission,
} from "@shared/schema";
import { getResumeTarget } from "@shared/constants";

export type EmployeeRef = {
  id: string;
  employeeId?: string | null;
  name?: string | null;
};

export function matchesEmployeeRef(
  employee: EmployeeRef,
  ref: string | null | undefined,
): boolean {
  if (!ref?.trim()) return false;
  const normalized = ref.trim();
  return (
    normalized === employee.id ||
    (employee.employeeId != null && normalized === employee.employeeId)
  );
}

export function candidateDeliveryKey(
  requirementId: string,
  candidateEmail?: string | null,
  candidateName?: string | null,
  fallbackId?: string | null,
): string {
  const candidate = (
    candidateEmail ||
    candidateName ||
    fallbackId ||
    ""
  )
    .toString()
    .trim()
    .toLowerCase();
  return `${requirementId}::${candidate}`;
}

export function requirementMatchesTalentAdvisor(
  employee: EmployeeRef,
  req: Pick<Requirement, "id" | "talentAdvisor" | "talentAdvisorId" | "isArchived">,
  activeAssignments: Pick<
    RequirementAssignment,
    "requirementId" | "recruiterId" | "status"
  >[],
): boolean {
  if (req.isArchived) return false;
  if (matchesEmployeeRef(employee, req.talentAdvisorId)) return true;
  if (
    (req.talentAdvisor || "").trim().toLowerCase() ===
    (employee.name || "").trim().toLowerCase()
  ) {
    return true;
  }
  return activeAssignments.some(
    (assignment) =>
      assignment.requirementId === req.id &&
      assignment.status === "active" &&
      matchesEmployeeRef(employee, assignment.recruiterId),
  );
}

export function buildRecruiterRequirementIdSet(
  employee: EmployeeRef,
  allRequirements: Requirement[],
  activeAssignments: RequirementAssignment[],
): Set<string> {
  const recruiterAssignments = activeAssignments.filter(
    (assignment) =>
      assignment.status === "active" &&
      matchesEmployeeRef(employee, assignment.recruiterId),
  );

  const requirementIds = new Set(
    recruiterAssignments.map((assignment) => assignment.requirementId),
  );

  for (const req of allRequirements) {
    if (req.isArchived) continue;
    if (requirementMatchesTalentAdvisor(employee, req, recruiterAssignments)) {
      requirementIds.add(req.id);
    }
  }

  return requirementIds;
}

/** True when a recruiter-tagged application counts as this TA's delivery. */
export function taggedCountsAsRecruiterDelivery(
  app: Pick<
    JobApplication,
    "requirementId" | "ownerEmployeeId" | "candidateEmail" | "candidateName" | "id"
  >,
  employee: EmployeeRef,
  requirementIds: Set<string>,
): boolean {
  if (!app.requirementId) return false;

  const ownedByRecruiter = matchesEmployeeRef(employee, app.ownerEmployeeId);
  const onScopedRequirement = requirementIds.has(app.requirementId);

  if (ownedByRecruiter) return true;
  if (onScopedRequirement && !app.ownerEmployeeId) return true;
  return onScopedRequirement;
}

export function parseDeliveryDate(
  value: string | Date | null | undefined,
): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function isDateOnDay(
  value: string | Date | null | undefined,
  date: string,
): boolean {
  const parsed = parseDeliveryDate(value);
  if (!parsed) return false;
  return parsed.toISOString().split("T")[0] === date;
}

export function isDateWithinRange(
  value: string | Date | null | undefined,
  dateFrom?: string,
  dateTo?: string,
): boolean {
  const parsed = parseDeliveryDate(value);
  if (!parsed) return false;
  if (dateFrom && parsed < new Date(dateFrom)) return false;
  if (dateTo && parsed > new Date(dateTo)) return false;
  return true;
}

export function countUniqueDeliveries(options: {
  requirementIds: Set<string>;
  submissions: ResumeSubmission[];
  taggedApplications: JobApplication[];
  recruiter?: EmployeeRef;
  exactDate?: string;
  dateFrom?: string;
  dateTo?: string;
}): number {
  const {
    requirementIds,
    submissions,
    taggedApplications,
    recruiter,
    exactDate,
    dateFrom,
    dateTo,
  } = options;

  const unique = new Set<string>();

  for (const submission of submissions) {
    if (recruiter && !matchesEmployeeRef(recruiter, submission.recruiterId)) {
      continue;
    }
    if (!requirementIds.has(submission.requirementId)) continue;

    const inRange = exactDate
      ? isDateOnDay(submission.submittedAt, exactDate)
      : isDateWithinRange(submission.submittedAt, dateFrom, dateTo);
    if (!inRange) continue;

    unique.add(
      candidateDeliveryKey(
        submission.requirementId,
        submission.candidateEmail,
        submission.candidateName,
        submission.id,
      ),
    );
  }

  for (const app of taggedApplications) {
    if (recruiter) {
      if (!taggedCountsAsRecruiterDelivery(app, recruiter, requirementIds)) {
        continue;
      }
    } else if (!app.requirementId || !requirementIds.has(app.requirementId)) {
      continue;
    }

    const inRange = exactDate
      ? isDateOnDay(app.appliedDate, exactDate)
      : isDateWithinRange(app.appliedDate, dateFrom, dateTo);
    if (!inRange) continue;

    unique.add(
      candidateDeliveryKey(
        app.requirementId!,
        app.candidateEmail,
        app.candidateName,
        app.id,
      ),
    );
  }

  return unique.size;
}

export function countUniqueDeliveriesForRequirement(
  requirementId: string,
  submissions: ResumeSubmission[],
  taggedApplications: JobApplication[],
  recruiter?: EmployeeRef,
  dateFrom?: string,
  dateTo?: string,
): number {
  return countUniqueDeliveries({
    requirementIds: new Set([requirementId]),
    submissions,
    taggedApplications,
    recruiter,
    dateFrom,
    dateTo,
  });
}

export function isRequirementDeliveryComplete(
  requirement: Pick<Requirement, "criticality" | "toughness">,
  deliveryCount: number,
): boolean {
  const target = getResumeTarget(requirement.criticality, requirement.toughness);
  return deliveryCount >= target;
}

export function getDefaultRateCriticalityKey(
  criticality: string,
  toughness: string,
): string {
  const crit = (criticality || "").toUpperCase();
  const tough = (toughness || "Medium").trim();
  if (crit === "HIGH" && tough.toLowerCase() === "tough") return "HT";
  if (crit === "HIGH") return "HM";
  if (crit === "MEDIUM" && tough.toLowerCase() !== "easy") return "MM";
  return "ME";
}
