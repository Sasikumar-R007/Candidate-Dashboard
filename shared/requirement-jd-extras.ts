export type RequirementJdExtras = {
  primarySkills: string | null;
  secondarySkills: string | null;
  knowledgeOnly: string | null;
  specialInstructions: string | null;
};

export type ClientJdSourceDetails = RequirementJdExtras & {
  jdText?: string | null;
  jdFile?: string | null;
  allSkills?: string[];
  submittedBy?: string;
  submittedAt?: string;
};

const STR_ROLE_ID_PATTERN = /^STR\d{5}$/;
const STREQ_ID_PATTERN = /^STREQ\d+$/i;

export function extractStreqId(
  requirement: { id?: string | null; sourceDetails?: string | null } | null | undefined,
): string | null {
  if (!requirement) return null;
  const id = requirement.id?.trim();
  if (id && STREQ_ID_PATTERN.test(id)) return id.toUpperCase();

  if (requirement.sourceDetails?.trim()) {
    try {
      const parsed = JSON.parse(requirement.sourceDetails) as Record<string, unknown>;
      const displayRequirementId = parsed.displayRequirementId;
      if (
        displayRequirementId &&
        STREQ_ID_PATTERN.test(String(displayRequirementId))
      ) {
        return String(displayRequirementId).toUpperCase();
      }
    } catch {
      // ignore invalid JSON
    }
  }
  return null;
}

/** Stable STREQ1, STREQ2, … labels for requirements (explicit id/sourceDetails or sequential by createdAt). */
export function buildStreqDisplayMap(
  requirements: Array<{ id: string; createdAt?: string | null; sourceDetails?: string | null }>,
): Map<string, string> {
  const map = new Map<string, string>();
  let maxExplicit = 0;

  for (const req of requirements) {
    const explicit = extractStreqId(req);
    if (explicit) {
      map.set(req.id, explicit);
      const num = parseInt(explicit.replace(/^STREQ/i, ""), 10);
      if (!Number.isNaN(num)) maxExplicit = Math.max(maxExplicit, num);
    }
  }

  const unassigned = requirements
    .filter((r) => !map.has(r.id))
    .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));

  let next = maxExplicit + 1;
  for (const req of unassigned) {
    map.set(req.id, `STREQ${next}`);
    next += 1;
  }

  return map;
}

/** Real DB id when row uses a recent-closed wrapper id. */
export function getRequirementLookupId(requirement: {
  id?: string | null;
  isRecentlyClosed?: boolean;
}): string {
  const id = requirement.id?.trim() || "";
  if (requirement.isRecentlyClosed && id.startsWith("recent-closed-")) {
    return id.replace(/^recent-closed-/, "");
  }
  return id;
}

/** TL-facing requirement id — STREQ format only (never UUID / STR role ids). */
export function resolveRequirementDisplayId(
  requirement:
    | {
        id?: string | null;
        sourceDetails?: string | null;
        displayRequirementId?: string | null;
        isRecentlyClosed?: boolean;
      }
    | string
    | null
    | undefined,
  streqFromMap?: string | null,
): string {
  if (requirement == null) return "N/A";
  if (typeof requirement === "string") {
    const id = requirement.trim();
    if (!id) return "N/A";
    if (STREQ_ID_PATTERN.test(id)) return id.toUpperCase();
    return "N/A";
  }

  if (streqFromMap?.trim()) return streqFromMap.toUpperCase();
  if (requirement.displayRequirementId?.trim()) {
    const display = requirement.displayRequirementId.trim().toUpperCase();
    if (STREQ_ID_PATTERN.test(display)) return display;
  }

  const streq = extractStreqId(requirement);
  if (streq) return streq;

  return "N/A";
}

export function mergeDisplayRequirementIdInSourceDetails(
  existingSourceDetails: string | null | undefined,
  displayRequirementId: string | null | undefined,
): string | null {
  const trimmed = displayRequirementId?.trim().toUpperCase() ?? "";
  if (!trimmed && !existingSourceDetails?.trim()) {
    return null;
  }
  let base: Record<string, unknown> = {};
  if (existingSourceDetails?.trim()) {
    try {
      base = JSON.parse(existingSourceDetails) as Record<string, unknown>;
    } catch {
      base = {};
    }
  }
  if (!trimmed) {
    return existingSourceDetails?.trim() ? existingSourceDetails : null;
  }
  return JSON.stringify({
    ...base,
    displayRequirementId: trimmed,
  });
}

/** Human-facing Role ID (STR26002) — from record id, split group, or stored displayRoleId. */
export function resolveDisplayRoleId(
  requirement:
    | {
        id?: string | null;
        sourceDetails?: string | null;
      }
    | string
    | null
    | undefined,
): string {
  if (requirement == null) return "N/A";

  if (typeof requirement === "string") {
    const id = requirement.trim();
    if (!id) return "N/A";
    if (STR_ROLE_ID_PATTERN.test(id)) return id;
    return id;
  }

  const id = requirement.id?.trim();
  if (id && STR_ROLE_ID_PATTERN.test(id)) return id;

  if (requirement.sourceDetails?.trim()) {
    try {
      const parsed = JSON.parse(requirement.sourceDetails) as Record<string, unknown>;
      const group = parsed.splitRequirementGroup as { roleId?: string } | undefined;
      if (group?.roleId && STR_ROLE_ID_PATTERN.test(String(group.roleId))) {
        return String(group.roleId);
      }
      const displayRoleId = parsed.displayRoleId ?? parsed.roleId;
      if (displayRoleId && STR_ROLE_ID_PATTERN.test(String(displayRoleId))) {
        return String(displayRoleId);
      }
    } catch {
      // ignore invalid JSON
    }
  }

  if (id) return id;
  return "N/A";
}

/** @deprecated Use resolveDisplayRoleId — kept for call sites that only pass id string. */
export function formatRoleIdShort(id?: string | null): string {
  return resolveDisplayRoleId(id);
}

/** Persist STR Role ID in sourceDetails for admin-created requirements (UUID primary keys). */
export function mergeDisplayRoleIdInSourceDetails(
  existingSourceDetails: string | null | undefined,
  displayRoleId: string | null | undefined,
): string | null {
  const trimmedRoleId = displayRoleId?.trim() ?? "";
  if (!trimmedRoleId && !existingSourceDetails?.trim()) {
    return null;
  }
  let base: Record<string, unknown> = {};
  if (existingSourceDetails?.trim()) {
    try {
      base = JSON.parse(existingSourceDetails) as Record<string, unknown>;
    } catch {
      base = {};
    }
  }
  if (!trimmedRoleId) {
    return existingSourceDetails?.trim() ? existingSourceDetails : null;
  }
  return JSON.stringify({
    ...base,
    displayRoleId: trimmedRoleId,
  });
}

export function buildClientJdSourceDetails(payload: {
  jdText?: string | null;
  jdFile?: string | null;
  primarySkills?: string | null;
  secondarySkills?: string | null;
  knowledgeOnly?: string | null;
  specialInstructions?: string | null;
  submittedBy?: string;
  submittedAt?: string;
}): string {
  const allSkills = [
    ...(payload.primarySkills ? payload.primarySkills.split(",").map((s) => s.trim()).filter(Boolean) : []),
    ...(payload.secondarySkills ? payload.secondarySkills.split(",").map((s) => s.trim()).filter(Boolean) : []),
    ...(payload.knowledgeOnly ? payload.knowledgeOnly.split(",").map((s) => s.trim()).filter(Boolean) : []),
  ];

  const details: ClientJdSourceDetails = {
    jdText: payload.jdText ?? null,
    jdFile: payload.jdFile ?? null,
    primarySkills: payload.primarySkills ?? null,
    secondarySkills: payload.secondarySkills ?? null,
    knowledgeOnly: payload.knowledgeOnly ?? null,
    specialInstructions: payload.specialInstructions ?? null,
    allSkills,
    submittedBy: payload.submittedBy,
    submittedAt: payload.submittedAt ?? new Date().toISOString(),
  };

  return JSON.stringify(details);
}

export function parseRequirementJdExtras(requirement: {
  sourceDetails?: string | null;
  sourceType?: string | null;
  primarySkills?: string | null;
  secondarySkills?: string | null;
  knowledgeOnly?: string | null;
  specialInstructions?: string | null;
} | null | undefined): RequirementJdExtras {
  const empty: RequirementJdExtras = {
    primarySkills: null,
    secondarySkills: null,
    knowledgeOnly: null,
    specialInstructions: null,
  };

  if (!requirement) return empty;

  if (requirement.sourceDetails?.trim()) {
    try {
      const parsed = JSON.parse(requirement.sourceDetails) as Partial<ClientJdSourceDetails>;
      return {
        primarySkills: parsed.primarySkills ?? null,
        secondarySkills: parsed.secondarySkills ?? null,
        knowledgeOnly: parsed.knowledgeOnly ?? null,
        specialInstructions: parsed.specialInstructions ?? null,
      };
    } catch {
      // fall through to direct fields
    }
  }

  return {
    primarySkills: requirement.primarySkills ?? null,
    secondarySkills: requirement.secondarySkills ?? null,
    knowledgeOnly: requirement.knowledgeOnly ?? null,
    specialInstructions: requirement.specialInstructions ?? null,
  };
}

export function enrichRequirementWithJdExtras<T extends Record<string, unknown>>(requirement: T): T & RequirementJdExtras {
  const extras = parseRequirementJdExtras(requirement as Parameters<typeof parseRequirementJdExtras>[0]);
  return { ...requirement, ...extras };
}

/** Merge admin "Instructions" into requirement sourceDetails JSON (no extra DB column). */
export function mergeRequirementInstructionsInSourceDetails(
  existingSourceDetails: string | null | undefined,
  specialInstructions: string | null | undefined,
): string | null {
  const trimmed = specialInstructions?.trim() ?? "";
  let base: Record<string, unknown> = {};
  if (existingSourceDetails?.trim()) {
    try {
      base = JSON.parse(existingSourceDetails) as Record<string, unknown>;
    } catch {
      base = {};
    }
  }
  if (!trimmed && Object.keys(base).length === 0) {
    return existingSourceDetails?.trim() ? existingSourceDetails : null;
  }
  return JSON.stringify({
    ...base,
    specialInstructions: trimmed || null,
  });
}
