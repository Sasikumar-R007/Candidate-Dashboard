import { parseRequirementJdExtras } from "./requirement-jd-extras";

/** Filter / ranking priority used across Source Resume scoring */
export const SOURCE_RESUME_MATCH_WEIGHTS = {
  requirement: {
    role: 0.25,
    skills: 0.35,
    experience: 0.2,
    location: 0.15,
    education: 0.05,
  },
  relevance: {
    specificSkills: 0.4,
    role: 0.25,
    searchQuery: 0.25,
    recency: 0.1,
  },
} as const;

export type MatchTier = "strong" | "good" | "possible" | "low";

export function getMatchTier(score: number): MatchTier {
  if (score >= 80) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "possible";
  return "low";
}

export function getMatchTierLabel(tier: MatchTier): string {
  switch (tier) {
    case "strong":
      return "Strong match";
    case "good":
      return "Good match";
    case "possible":
      return "Possible match";
    default:
      return "";
  }
}

function splitSkillsCsv(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractExperienceRangeFromJd(jdText: string): [number, number] | null {
  const rangeMatch = jdText.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(?:\+?\s*)?(?:years?|yrs?)/i);
  if (rangeMatch) {
    return [parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10)];
  }
  const single = jdText.match(/(\d+)\s*\+?\s*(?:years?|yrs?)/i);
  if (single) {
    const min = parseInt(single[1], 10);
    return [min, min + 5];
  }
  return null;
}

function extractLocationFromJd(jdText: string): string {
  const patterns = [
    /(?:location|work location|job location)[\s:]+([^\n.;]{3,80})/i,
    /(?:based in|located in)\s+([^\n.;]{3,60})/i,
  ];
  for (const pattern of patterns) {
    const match = jdText.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  if (/\bremote\b/i.test(jdText)) return "Remote";
  if (/\bhybrid\b/i.test(jdText)) return "Hybrid";
  return "";
}

export type RequirementMatchContext = {
  position: string;
  primarySkills: string[];
  secondarySkills: string[];
  experienceRange: [number, number] | null;
  location: string;
  education: string;
};

export function extractRequirementMatchContext(
  requirement: Record<string, unknown> | null | undefined,
): RequirementMatchContext {
  if (!requirement) {
    return {
      position: "",
      primarySkills: [],
      secondarySkills: [],
      experienceRange: null,
      location: "",
      education: "",
    };
  }

  const extras = parseRequirementJdExtras(requirement as Parameters<typeof parseRequirementJdExtras>[0]);
  const jdText = String(requirement.jdText || "").trim();
  const sourceDetailsRaw = requirement.sourceDetails;
  let education = "";

  if (typeof sourceDetailsRaw === "string" && sourceDetailsRaw.trim()) {
    try {
      const parsed = JSON.parse(sourceDetailsRaw) as Record<string, unknown>;
      if (typeof parsed.education === "string") {
        education = parsed.education;
      }
    } catch {
      // ignore invalid JSON
    }
  }

  return {
    position: String(requirement.position || requirement.jobTitle || ""),
    primarySkills: splitSkillsCsv(extras.primarySkills),
    secondarySkills: splitSkillsCsv(extras.secondarySkills),
    experienceRange: extractExperienceRangeFromJd(jdText),
    location: extractLocationFromJd(jdText),
    education,
  };
}

function normalizeSkillToken(value: string): string {
  return value.trim().toLowerCase();
}

function parseCandidateSkills(candidate: Record<string, unknown>): string[] {
  const raw = candidate.skills;
  if (Array.isArray(raw)) {
    return raw.map((s) => normalizeSkillToken(String(s))).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/[,;\n]/)
      .map((s) => normalizeSkillToken(s))
      .filter(Boolean);
  }
  return [];
}

function getCandidateTitle(candidate: Record<string, unknown>): string {
  return String(
    candidate.designation || candidate.currentRole || candidate.title || candidate.position || "",
  ).toLowerCase();
}

function getCandidateExperienceYears(candidate: Record<string, unknown>): number {
  const raw = candidate.experience;
  if (typeof raw === "number" && !Number.isNaN(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = parseFloat(raw.replace(/[^\d.]/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function getCandidateLocation(candidate: Record<string, unknown>): string {
  return String(candidate.location || "").toLowerCase();
}

function getCandidatePreferredLocation(candidate: Record<string, unknown>): string {
  return String(candidate.preferredLocation || "").toLowerCase();
}

function getCandidateEducation(candidate: Record<string, unknown>): string {
  return String(candidate.education || "").toLowerCase();
}

/** Levenshtein-based similarity — duplicated lightly to keep shared module server-safe */
function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  const distance = matrix[b.length][a.length];
  return 1 - distance / Math.max(a.length, b.length);
}

function skillMatchRatio(candidateSkills: string[], requiredSkills: string[]): number {
  if (requiredSkills.length === 0) return 0;
  let matches = 0;
  for (const reqSkill of requiredSkills) {
    const normalized = normalizeSkillToken(reqSkill);
    if (
      candidateSkills.some(
        (cs) => cs.includes(normalized) || normalized.includes(cs) || stringSimilarity(cs, normalized) >= 0.85,
      )
    ) {
      matches++;
    }
  }
  return matches / requiredSkills.length;
}

/**
 * Unified requirement fit score (0–100) using JD extras, position, and jdText hints.
 */
export function calculateRequirementMatchScore(
  candidate: Record<string, unknown>,
  requirement: Record<string, unknown> | null | undefined,
): number {
  if (!requirement) return 0;

  const ctx = extractRequirementMatchContext(requirement);
  const weights = SOURCE_RESUME_MATCH_WEIGHTS.requirement;
  let matchScore = 0;
  let totalWeight = 0;

  if (ctx.position) {
    const titleSimilarity = stringSimilarity(getCandidateTitle(candidate), ctx.position.toLowerCase());
    matchScore += titleSimilarity * 100 * weights.role;
    totalWeight += weights.role;
  }

  const reqSkills = [...ctx.primarySkills, ...ctx.secondarySkills];
  if (reqSkills.length > 0) {
    const skillScore = skillMatchRatio(parseCandidateSkills(candidate), reqSkills) * 100;
    matchScore += skillScore * weights.skills;
    totalWeight += weights.skills;
  } else if (Array.isArray(requirement.skills) && requirement.skills.length > 0) {
    const skillScore =
      skillMatchRatio(parseCandidateSkills(candidate), requirement.skills as string[]) * 100;
    matchScore += skillScore * weights.skills;
    totalWeight += weights.skills;
  } else if (Array.isArray(requirement.requiredSkills) && requirement.requiredSkills.length > 0) {
    const skillScore =
      skillMatchRatio(parseCandidateSkills(candidate), requirement.requiredSkills as string[]) * 100;
    matchScore += skillScore * weights.skills;
    totalWeight += weights.skills;
  }

  if (ctx.experienceRange) {
    const candidateExp = getCandidateExperienceYears(candidate);
    const [minExp, maxExp] = ctx.experienceRange;
    const mid = (minExp + maxExp) / 2;
    const range = Math.max(1, maxExp - minExp);
    const expDiff = Math.abs(candidateExp - mid);
    const expScore = Math.max(0, 100 - (expDiff / range) * 50);
    matchScore += expScore * weights.experience;
    totalWeight += weights.experience;
  } else if (requirement.experience) {
    const reqExp = parseFloat(String(requirement.experience).replace(/[^\d.]/g, "")) || 0;
    const expDiff = Math.abs(getCandidateExperienceYears(candidate) - reqExp);
    const expScore = Math.max(0, 100 - expDiff * 10);
    matchScore += expScore * weights.experience;
    totalWeight += weights.experience;
  }

  const reqLocation = ctx.location || String(requirement.location || "");
  if (reqLocation) {
    const loc = reqLocation.toLowerCase();
    const locationMatch =
      getCandidateLocation(candidate).includes(loc) ||
      getCandidatePreferredLocation(candidate).includes(loc);
    matchScore += (locationMatch ? 100 : 0) * weights.location;
    totalWeight += weights.location;
  }

  const reqEducation = ctx.education || String(requirement.education || "");
  if (reqEducation) {
    const eduMatch = getCandidateEducation(candidate).includes(reqEducation.toLowerCase());
    matchScore += (eduMatch ? 100 : 0) * weights.education;
    totalWeight += weights.education;
  }

  return totalWeight > 0 ? Math.round(matchScore / totalWeight) : 0;
}

export function calculateRecencyScore(
  candidate: Record<string, unknown>,
  referenceDate: Date = new Date(),
): number {
  const raw = candidate.lastViewedAt || candidate.updatedAt || candidate.createdAt;
  if (!raw) return 0;
  const date = new Date(String(raw));
  if (Number.isNaN(date.getTime())) return 0;
  const daysSince = (referenceDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, 100 - (daysSince / 30) * 10);
}

export type SourceResumeFilterSnapshot = {
  keywords: string[];
  excludedKeywords: string[];
  specificSkills: string[];
  searchQuery: string;
  booleanMode: boolean;
  experience: [number, number];
  ctcMin: string;
  ctcMax: string;
  location: string[];
  role: string[];
  noticePeriod: string;
  preferredLocation: string[];
  company: string[];
  excludedCompanies: string[];
  educationUG: string[];
  educationPG: string[];
  selectedRequirementId?: string;
};

/**
 * Fill empty filter fields from a requirement without overwriting user edits.
 */
export function mergeRequirementIntoFilters<T extends SourceResumeFilterSnapshot>(
  requirement: Record<string, unknown>,
  prev: T,
  defaults: Pick<T, "experience">,
): T {
  const ctx = extractRequirementMatchContext(requirement);
  const next: T = { ...prev };

  if (ctx.position && prev.role.length === 0) {
    next.role = [ctx.position];
  }
  if (ctx.primarySkills.length > 0 && prev.specificSkills.length === 0) {
    next.specificSkills = ctx.primarySkills.slice(0, 12);
  }
  if (ctx.secondarySkills.length > 0 && prev.keywords.length === 0) {
    next.keywords = ctx.secondarySkills.slice(0, 10);
  }
  if (
    ctx.experienceRange &&
    prev.experience[0] === defaults.experience[0] &&
    prev.experience[1] === defaults.experience[1]
  ) {
    next.experience = ctx.experienceRange;
  }
  if (ctx.location && prev.location.length === 0) {
    next.location = [ctx.location];
  }

  return next;
}

export type ActiveFilterChip = {
  id: string;
  label: string;
  category: string;
};

export function buildActiveFilterChips(
  filters: SourceResumeFilterSnapshot,
  requirementLabel?: string,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.selectedRequirementId && requirementLabel) {
    chips.push({
      id: "requirement",
      label: requirementLabel,
      category: "Requirement",
    });
  }

  for (const role of filters.role) {
    chips.push({ id: `role-${role}`, label: role, category: "Role" });
  }
  for (const skill of filters.specificSkills) {
    chips.push({ id: `skill-${skill}`, label: skill, category: "Must-have skill" });
  }
  for (const keyword of filters.keywords) {
    chips.push({ id: `kw-${keyword}`, label: keyword, category: "Keyword" });
  }
  if (filters.booleanMode && filters.searchQuery.trim()) {
    chips.push({
      id: "boolean-query",
      label: filters.searchQuery.trim(),
      category: "Boolean",
    });
  }
  if (filters.experience[0] > 0 || filters.experience[1] < 15) {
    chips.push({
      id: "experience",
      label: `${filters.experience[0]}-${filters.experience[1]} yrs`,
      category: "Experience",
    });
  }
  for (const loc of filters.location) {
    chips.push({ id: `loc-${loc}`, label: loc, category: "Location" });
  }
  for (const loc of filters.preferredLocation) {
    chips.push({ id: `pref-${loc}`, label: loc, category: "Preferred location" });
  }
  if (filters.noticePeriod.trim()) {
    chips.push({
      id: "notice",
      label: filters.noticePeriod,
      category: "Notice period",
    });
  }
  for (const course of filters.educationUG) {
    chips.push({ id: `ug-${course}`, label: course, category: "UG" });
  }
  for (const course of filters.educationPG) {
    chips.push({ id: `pg-${course}`, label: course, category: "PG" });
  }
  for (const company of filters.company) {
    chips.push({ id: `co-${company}`, label: company, category: "Company" });
  }
  if (filters.ctcMin.trim() || filters.ctcMax.trim()) {
    chips.push({
      id: "ctc",
      label: `${filters.ctcMin || "0"}-${filters.ctcMax || "∞"}L`,
      category: "CTC",
    });
  }
  for (const kw of filters.excludedKeywords) {
    chips.push({ id: `ex-kw-${kw}`, label: `NOT ${kw}`, category: "Exclude" });
  }
  for (const co of filters.excludedCompanies) {
    chips.push({ id: `ex-co-${co}`, label: `NOT ${co}`, category: "Exclude company" });
  }

  return chips;
}

/**
 * Score recommended sidebar candidates using the same signals as main search.
 */
export function scoreRecommendedCandidate(
  candidate: Record<string, unknown>,
  options: {
    requirement?: Record<string, unknown> | null;
    keywords: string[];
    specificSkills: string[];
    roles: string[];
    locations: string[];
    selectedCandidateSkills?: string[];
    searchText?: string;
  },
): number {
  let score = 0;

  if (options.requirement) {
    score += calculateRequirementMatchScore(candidate, options.requirement) * 0.4;
  }

  const candidateSkills = parseCandidateSkills(candidate);
  if (options.specificSkills.length > 0) {
    score += skillMatchRatio(candidateSkills, options.specificSkills) * 25;
  }

  if (options.keywords.length > 0) {
    const haystack = String(
      options.searchText ||
        [
          getCandidateTitle(candidate),
          candidateSkills.join(" "),
          getCandidateLocation(candidate),
          String(candidate.company || ""),
        ].join(" "),
    ).toLowerCase();
    const kwMatches = options.keywords.filter((kw) => haystack.includes(kw.toLowerCase())).length;
    score += (kwMatches / options.keywords.length) * 20;
  }

  if (options.roles.length > 0) {
    const title = getCandidateTitle(candidate);
    const best = Math.max(...options.roles.map((role) => stringSimilarity(title, role.toLowerCase())));
    score += best * 15;
  }

  if (options.locations.length > 0) {
    const matches = options.locations.some((loc) => {
      const needle = loc.toLowerCase();
      return (
        getCandidateLocation(candidate).includes(needle) ||
        getCandidatePreferredLocation(candidate).includes(needle)
      );
    });
    if (matches) score += 10;
  }

  if (options.selectedCandidateSkills && options.selectedCandidateSkills.length > 0) {
    const common = candidateSkills.filter((s) =>
      options.selectedCandidateSkills!.some((ss) => ss.toLowerCase() === s),
    ).length;
    score += Math.min(10, common * 3);
  }

  score += calculateRecencyScore(candidate) * 0.05;

  return score;
}
