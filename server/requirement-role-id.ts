import type { IStorage } from "./storage";
import { extractStreqId } from "@shared/requirement-jd-extras";

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
  const allRequirements = await storage.getRequirements();
  const prefix = `STR${currentYear}`;

  let maxNumber = 0;
  for (const req of allRequirements) {
    if (!req.id || !req.id.startsWith(prefix)) continue;
    const suffix = req.id.slice(prefix.length);
    const match = suffix.match(/^(\d{3})/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!Number.isNaN(num) && num > maxNumber) maxNumber = num;
    }
  }

  let attempts = 0;
  while (attempts < 20) {
    const nextNumber = String(maxNumber + 1 + attempts).padStart(3, "0");
    const roleId = `${prefix}${nextNumber}`;
    const exists = allRequirements.some((r) => r.id === roleId);
    if (!exists) return roleId;
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
