import type { IStorage } from "./storage";

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
