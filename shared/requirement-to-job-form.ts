import { parseRequirementJdExtras } from "./requirement-jd-extras";

export type JobFormFromRequirement = {
  requirementId: string;
  companyName: string;
  companyTagline: string;
  companyType: string;
  market: string;
  field: string;
  noOfPositions: string;
  role: string;
  experience: string;
  location: string;
  workMode: string;
  employmentType: string;
  salaryPackage: string;
  aboutCompany: string;
  roleDefinitions: string;
  keyResponsibility: string;
  primarySkills: string[];
  secondarySkills: string[];
  knowledgeOnly: string[];
  companyLogo: string;
};

function splitSkillsCsv(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractExperienceFromJd(jdText: string): string {
  const match = jdText.match(
    /(\d+)\s*[-–to]+\s*(\d+)\s*(?:\+?\s*)?(?:years?|yrs?)/i,
  );
  if (match) return `${match[1]}-${match[2]} years`;
  const single = jdText.match(/(\d+)\s*\+?\s*(?:years?|yrs?)/i);
  if (single) return `${single[1]}+ years`;
  return "";
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

function extractWorkModeFromJd(jdText: string, location: string): string {
  const combined = `${jdText} ${location}`.toLowerCase();
  if (combined.includes("remote")) return "Remote";
  if (combined.includes("hybrid")) return "Hybrid";
  if (combined.includes("on-site") || combined.includes("onsite") || combined.includes("office")) {
    return "On-site";
  }
  return "";
}

/** Maps a TL requirement record into Post Job form defaults (partial fields only). */
export function mapRequirementToJobForm(
  requirement: Record<string, unknown> & {
    id?: string;
    company?: string;
    position?: string;
    noOfPositions?: number;
    jdText?: string | null;
    sourceDetails?: string | null;
  },
): JobFormFromRequirement {
  const extras = parseRequirementJdExtras(requirement);
  const jdText = (requirement.jdText as string | undefined)?.trim() || "";

  const experience = extractExperienceFromJd(jdText);
  const location = extractLocationFromJd(jdText);
  const workMode = extractWorkModeFromJd(jdText, location);

  return {
    requirementId: String(requirement.id || ""),
    companyName: (requirement.company as string) || "",
    companyTagline: "",
    companyType: "",
    market: "",
    field: "",
    noOfPositions: String(requirement.noOfPositions ?? 1),
    role: (requirement.position as string) || "",
    experience,
    location,
    workMode,
    employmentType: "",
    salaryPackage: "",
    aboutCompany: "",
    roleDefinitions: jdText,
    keyResponsibility: extras.specialInstructions?.trim() || "",
    primarySkills: splitSkillsCsv(extras.primarySkills),
    secondarySkills: splitSkillsCsv(extras.secondarySkills),
    knowledgeOnly: splitSkillsCsv(extras.knowledgeOnly),
    companyLogo: "",
  };
}
