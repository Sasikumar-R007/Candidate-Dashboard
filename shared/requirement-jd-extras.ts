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

export function formatRoleIdShort(id?: string | null): string {
  if (!id?.trim()) return "N/A";
  const trimmed = id.trim();
  if (trimmed.includes("-")) {
    return `ROL-${trimmed.split("-")[0].substring(0, 6).toUpperCase()}`;
  }
  return trimmed;
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
