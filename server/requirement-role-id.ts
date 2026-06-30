import type { IStorage } from "./storage";
import type { RecruiterJob } from "@shared/schema";
import {
  extractStreqId,
  getRequirementTlSplitMeta,
  isValidStrRoleId,
  normalizeStrRoleId,
  resolveDisplayRoleId,
} from "@shared/requirement-jd-extras";

type RequirementRoleRef = {
  id: string;
  company?: string | null;
  position?: string | null;
  sourceDetails?: string | null;
  isArchived?: boolean | null;
  managementReason?: string | null;
};

/** True when two requirements belong to the same admin TL split (shared Role ID by design). */
export function requirementsShareJobPostingRoleGroup(
  a: RequirementRoleRef,
  b: RequirementRoleRef,
): boolean {
  if (String(a.id) === String(b.id)) return true;
  const metaA = getRequirementTlSplitMeta(a);
  const metaB = getRequirementTlSplitMeta(b);
  if (!metaA?.roleId || !metaB?.roleId) return false;
  return (
    normalizeStrRoleId(metaA.roleId) === normalizeStrRoleId(metaB.roleId) &&
    String(a.company || "").trim().toLowerCase() ===
      String(b.company || "").trim().toLowerCase()
  );
}

async function loadAllRequirementsForRoleIdIndex(
  storage: IStorage,
): Promise<RequirementRoleRef[]> {
  const active = await storage.getRequirements();
  const archived = await storage.getArchivedRequirements();
  const byId = new Map<string, RequirementRoleRef>();

  for (const req of active) {
    byId.set(String(req.id), req);
  }
  for (const archivedReq of archived) {
    const originalId = String(archivedReq.originalId || archivedReq.id);
    if (!byId.has(originalId)) {
      byId.set(originalId, {
        id: originalId,
        company: archivedReq.company,
        position: archivedReq.position,
        sourceDetails: archivedReq.sourceDetails,
        isArchived: true,
        managementReason: archivedReq.managementReason,
      });
    }
  }
  return Array.from(byId.values());
}

function collectUsedStrRoleIdsFromList(
  requirements: Array<{ id?: string | null; sourceDetails?: string | null }>,
): Set<string> {
  const used = new Set<string>();
  for (const req of requirements) {
    if (req.id && isValidStrRoleId(req.id)) {
      used.add(String(req.id).trim().toUpperCase());
    }
    const resolved = normalizeStrRoleId(resolveDisplayRoleId(req));
    if (resolved) used.add(resolved);
  }
  return used;
}

/** Find another active requirement already using this Role ID (excluding intentional TL splits). */
export async function findConflictingRequirementForRoleId(
  storage: IStorage,
  roleId: string,
  options?: {
    excludeRequirementIds?: string[];
    allowSharedRoleIdForSplitGroup?: string | null;
  },
): Promise<RequirementRoleRef | null> {
  const normalized = normalizeStrRoleId(roleId);
  if (!normalized) return null;

  const exclude = new Set(
    (options?.excludeRequirementIds || []).map((id) => String(id)),
  );
  const allRequirements = await loadAllRequirementsForRoleIdIndex(storage);

  for (const req of allRequirements) {
    if (exclude.has(String(req.id))) continue;
    if (req.isArchived) continue;
    if (req.managementReason === "Split among Talent Advisors") continue;

    const reqRoleId = normalizeStrRoleId(resolveDisplayRoleId(req));
    if (reqRoleId !== normalized) continue;

    if (options?.allowSharedRoleIdForSplitGroup) {
      const splitMeta = getRequirementTlSplitMeta(req);
      if (
        splitMeta?.roleId &&
        normalizeStrRoleId(splitMeta.roleId) ===
          normalizeStrRoleId(options.allowSharedRoleIdForSplitGroup)
      ) {
        continue;
      }
    }

    return req;
  }

  return null;
}

export type DuplicateJobBlockInfo = {
  jobId: string;
  postedBy: string;
  roleId: string;
  position: string;
  requirementId: string;
};

function resolveJobPosterName(
  job: RecruiterJob,
  employeesById: Map<string, { name: string }>,
): string {
  const owner = job.ownerEmployeeId
    ? employeesById.get(job.ownerEmployeeId)?.name
    : undefined;
  if (owner) return owner;
  const recruiter = job.recruiterId
    ? employeesById.get(job.recruiterId)?.name
    : undefined;
  if (recruiter) return recruiter;
  if (job.assignedTaName?.trim()) return job.assignedTaName.trim();
  return "Another team member";
}

function shouldIgnoreRequirementForDuplicateCheck(
  requirement:
    | {
        isArchived?: boolean | null;
        managementReason?: string | null;
      }
    | null
    | undefined,
): boolean {
  if (!requirement) return true;
  if (requirement.isArchived) return true;
  if (requirement.managementReason === "Split among Talent Advisors") return true;
  return false;
}

/** Returns an existing active job that should block posting for this requirement / Role ID. */
export async function findDuplicateRecruiterJobForPosting(
  storage: IStorage,
  params: {
    requirementId: string;
    requirement: {
      id: string;
      company?: string | null;
      position?: string | null;
      sourceDetails?: string | null;
      isArchived?: boolean | null;
      managementReason?: string | null;
    };
    resolvedRoleId: string | null | undefined;
  },
  employees: Array<{ id: string; name: string }>,
): Promise<DuplicateJobBlockInfo | null> {
  const normalizedRoleId = normalizeStrRoleId(params.resolvedRoleId);
  const targetCompany = String(params.requirement.company || "").trim().toLowerCase();

  const existingJobs = await storage.getAllRecruiterJobs();
  const activeJobs = existingJobs.filter(
    (job) => job.status !== "Closed" && job.requirementId,
  );
  if (activeJobs.length === 0) return null;

  const activeRequirements = await storage.getRequirements();
  const archivedRequirements = await storage.getArchivedRequirements();
  const requirementById = new Map<
    string,
    {
      id: string;
      company?: string | null;
      position?: string | null;
      sourceDetails?: string | null;
      isArchived?: boolean | null;
      managementReason?: string | null;
    }
  >();

  for (const req of activeRequirements) {
    requirementById.set(String(req.id), req);
  }
  for (const archived of archivedRequirements) {
    const originalId = String(archived.originalId || archived.id);
    if (!requirementById.has(originalId)) {
      requirementById.set(originalId, {
        id: originalId,
        company: archived.company,
        position: archived.position,
        sourceDetails: archived.sourceDetails,
        isArchived: true,
        managementReason: archived.managementReason,
      });
    }
  }

  const employeesById = new Map(employees.map((emp) => [emp.id, emp]));

  for (const job of activeJobs) {
    const jobRequirementId = String(job.requirementId);
    let linkedReq =
      requirementById.get(jobRequirementId) ||
      (await storage.getRequirementById(jobRequirementId));

    if (!linkedReq) continue;

    const postedBy = resolveJobPosterName(job, employeesById);
    const buildInfo = (
      roleId: string,
      requirement: { position?: string | null },
    ): DuplicateJobBlockInfo => ({
      jobId: job.id,
      postedBy,
      roleId,
      position: String(requirement.position || "this role").trim(),
      requirementId: jobRequirementId,
    });

    if (jobRequirementId === params.requirementId) {
      return buildInfo(
        normalizedRoleId || resolveDisplayRoleId(params.requirement),
        linkedReq,
      );
    }

    if (shouldIgnoreRequirementForDuplicateCheck(linkedReq)) continue;
    if (!normalizedRoleId) continue;

    const jobRoleId = normalizeStrRoleId(resolveDisplayRoleId(linkedReq));
    if (!jobRoleId || jobRoleId !== normalizedRoleId) continue;

    // Only block on shared Role ID for intentional admin TL splits — not accidental duplicates.
    if (
      !requirementsShareJobPostingRoleGroup(params.requirement, {
        id: jobRequirementId,
        company: linkedReq.company,
        position: linkedReq.position,
        sourceDetails: linkedReq.sourceDetails,
      })
    ) {
      continue;
    }

    const jobCompany = String(linkedReq.company || "").trim().toLowerCase();
    if (targetCompany && jobCompany && jobCompany !== targetCompany) continue;

    return buildInfo(jobRoleId, linkedReq);
  }

  return null;
}


/** Resolve STREQ display id consistently with client buildStreqDisplayMap. */
export async function resolveStreqDisplayIdForRequirement(
  storage: IStorage,
  requirement: {
    id: string;
    createdAt?: string | null;
    sourceDetails?: string | null;
  },
): Promise<string> {
  const { extractStreqId, buildStreqDisplayMap } = await import(
    "@shared/requirement-jd-extras"
  );
  const explicit = extractStreqId(requirement);
  if (explicit) return explicit;

  const activeReqs = await storage.getRequirements();
  const map = buildStreqDisplayMap(
    activeReqs.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      sourceDetails: r.sourceDetails,
    })),
  );
  return map.get(requirement.id) ?? generateNextStreqId(storage);
}

/** Generate next TL requirement display id: STREQ1, STREQ2, … */
export async function generateNextStreqId(storage: IStorage): Promise<string> {
  const allRequirements = await storage.getRequirements();
  let maxNumber = 0;

  for (const req of allRequirements) {
    const explicit = extractStreqId(req);
    if (explicit) {
      const num = parseInt(explicit.replace(/^STREQ/i, ""), 10);
      if (!Number.isNaN(num)) maxNumber = Math.max(maxNumber, num);
    }
  }

  let attempts = 0;
  while (attempts < 50) {
    const candidate = `STREQ${maxNumber + 1 + attempts}`;
    const exists = allRequirements.some(
      (r) => extractStreqId(r)?.toUpperCase() === candidate,
    );
    if (!exists) return candidate;
    attempts++;
  }

  throw new Error("Failed to generate unique STREQ id");
}

/** Generate next Role ID in format STR + YY + 3-digit sequence (e.g. STR25001). */
export async function generateNextRequirementRoleId(
  storage: IStorage,
): Promise<string> {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const allRequirements = await loadAllRequirementsForRoleIdIndex(storage);
  const prefix = `STR${currentYear}`;
  const usedRoleIds = collectUsedStrRoleIdsFromList(allRequirements);

  let maxNumber = 0;
  for (const roleId of usedRoleIds) {
    if (!roleId.startsWith(prefix)) continue;
    const suffix = roleId.slice(prefix.length);
    const match = suffix.match(/^(\d{3})/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!Number.isNaN(num) && num > maxNumber) maxNumber = num;
    }
  }

  let attempts = 0;
  while (attempts < 50) {
    const nextNumber = String(maxNumber + 1 + attempts).padStart(3, "0");
    const roleId = `${prefix}${nextNumber}`;
    if (!usedRoleIds.has(roleId)) return roleId;
    attempts++;
  }

  throw new Error("Failed to generate unique role ID");
}

export function buildSplitRequirementSourceDetails(
  sharedRoleId: string,
  splitIndex: number,
  totalSplits: number,
  teamLeadName: string,
  existingSourceDetails?: string | null,
): string {
  let base: Record<string, unknown> = {};
  if (existingSourceDetails) {
    try {
      base = JSON.parse(existingSourceDetails) as Record<string, unknown>;
    } catch {
      base = {};
    }
  }
  return JSON.stringify({
    ...base,
    splitRequirementGroup: {
      roleId: sharedRoleId,
      splitIndex,
      totalSplits,
      teamLead: teamLeadName,
    },
  });
}

/** Metadata when a TL splits one requirement across multiple TAs by position count. */
export function buildSplitTaAssignmentSourceDetails(
  sharedDisplayRequirementId: string,
  parentRequirementId: string,
  splitIndex: number,
  totalSplits: number,
  originalTotalPositions: number,
  existingSourceDetails?: string | null,
): string {
  let base: Record<string, unknown> = {};
  if (existingSourceDetails) {
    try {
      base = JSON.parse(existingSourceDetails) as Record<string, unknown>;
    } catch {
      base = {};
    }
  }
  return JSON.stringify({
    ...base,
    displayRequirementId: sharedDisplayRequirementId,
    splitTaAssignmentGroup: {
      parentRequirementId,
      sharedDisplayRequirementId,
      splitIndex,
      totalSplits,
      originalTotalPositions,
    },
  });
}
