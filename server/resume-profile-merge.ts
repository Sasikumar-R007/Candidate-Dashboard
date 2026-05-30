import type { Profile } from "@shared/schema";
import { normalizeParsedEducation, normalizeParsedSkills } from "./parsed-field-format";

export type ResumeFieldChangeSource = "from_resume" | "retained";

export interface ResumeFieldChange {
  key: string;
  label: string;
  category: "basic" | "education" | "job" | "skills" | "links" | "resume";
  currentValue: string | null;
  newValue: string | null;
  source: ResumeFieldChangeSource;
}

export interface ResumeMergePreviewResult {
  mergedProfile: Record<string, unknown>;
  mergedCandidate: Record<string, unknown>;
  skillList: string[];
  changes: ResumeFieldChange[];
  fromResume: ResumeFieldChange[];
  retained: ResumeFieldChange[];
}

type CandidateRow = {
  id: string;
  candidateId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  designation?: string | null;
  experience?: string | null;
  location?: string | null;
  skills?: string | null;
  education?: string | null;
  currentRole?: string | null;
  portfolioUrl?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  ctc?: string | null;
  ectc?: string | null;
  noticePeriod?: string | null;
  position?: string | null;
  employmentType?: string | null;
  productService?: string | null;
  productCategory?: string | null;
  productDomain?: string | null;
  resumeFile?: string | null;
  resumeText?: string | null;
  registrationStage?: string | null;
};

const PLACEHOLDER_VALUES = new Set(["unknown", "not set", "n/a", "-", "none"]);

export function hasMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return !PLACEHOLDER_VALUES.has(trimmed.toLowerCase());
  }
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function pickMergedValue<T>(parsed: T | null | undefined, existing: T | null | undefined): T | null {
  if (hasMeaningfulValue(parsed)) return parsed as T;
  if (hasMeaningfulValue(existing)) return existing as T;
  return null;
}

function displayValue(value: unknown): string | null {
  if (!hasMeaningfulValue(value)) return null;
  return String(value).trim();
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Unknown", lastName: "Unknown" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") || parts[0] };
}

function buildChange(
  key: string,
  label: string,
  category: ResumeFieldChange["category"],
  currentValue: unknown,
  parsedValue: unknown,
  mergedValue: unknown,
): ResumeFieldChange | null {
  const current = displayValue(currentValue);
  const parsed = displayValue(parsedValue);
  const merged = displayValue(mergedValue);

  if (!hasMeaningfulValue(parsed) && !hasMeaningfulValue(current) && !hasMeaningfulValue(merged)) {
    return null;
  }

  const source: ResumeFieldChangeSource =
    hasMeaningfulValue(parsed) && merged === parsed ? "from_resume" : "retained";

  if (source === "retained" && current === merged) {
    return {
      key,
      label,
      category,
      currentValue: current,
      newValue: merged,
      source: "retained",
    };
  }

  if (source === "from_resume" && current === merged) {
    return null;
  }

  return {
    key,
    label,
    category,
    currentValue: current,
    newValue: merged,
    source,
  };
}

export function buildResumeMergePreview(
  candidate: CandidateRow,
  existingProfile: Profile | undefined,
  ai: Record<string, unknown>,
  fileUrl: string,
  rawText: string | null,
): ResumeMergePreviewResult {
  const normalizedSkillCsv = normalizeParsedSkills(ai.skills as string | undefined);
  const normalizedEducation = normalizeParsedEducation(ai.education as string | undefined);

  const parsedFullName = pickMergedValue(
    (ai.full_name as string) || (ai.fullName as string),
    candidate.fullName,
  );
  const nameParts = parsedFullName ? splitFullName(parsedFullName) : { firstName: "Unknown", lastName: "Unknown" };

  const existingFirst = existingProfile?.firstName;
  const existingLast = existingProfile?.lastName;
  const mergedFirst = pickMergedValue(nameParts.firstName, existingFirst);
  const mergedLast = pickMergedValue(nameParts.lastName, existingLast);

  const professionalTitle = pickMergedValue(
    (ai.current_role as string) || (ai.designation as string),
    existingProfile?.title || existingProfile?.currentRole,
  );

  const fieldSpecs: Array<{
    key: string;
    label: string;
    category: ResumeFieldChange["category"];
    current: unknown;
    parsed: unknown;
    merged: unknown;
  }> = [
    {
      key: "fullName",
      label: "Full name",
      category: "basic",
      current: existingProfile
        ? `${existingProfile.firstName} ${existingProfile.lastName}`.trim()
        : candidate.fullName,
      parsed: parsedFullName,
      merged: [mergedFirst, mergedLast].filter(Boolean).join(" "),
    },
    {
      key: "email",
      label: "Email",
      category: "basic",
      current: existingProfile?.email ?? candidate.email,
      parsed: ai.email,
      merged: pickMergedValue(ai.email as string, existingProfile?.email ?? candidate.email),
    },
    {
      key: "phone",
      label: "Phone",
      category: "basic",
      current: existingProfile?.phone ?? candidate.phone,
      parsed: ai.phone,
      merged: pickMergedValue(ai.phone as string, existingProfile?.phone ?? candidate.phone),
    },
    {
      key: "location",
      label: "Location",
      category: "basic",
      current: existingProfile?.location ?? existingProfile?.currentLocation ?? candidate.location,
      parsed: ai.location,
      merged: pickMergedValue(
        ai.location as string,
        existingProfile?.currentLocation ?? existingProfile?.location ?? candidate.location,
      ),
    },
    {
      key: "title",
      label: "Professional title",
      category: "job",
      current: existingProfile?.title,
      parsed: professionalTitle,
      merged: professionalTitle ?? existingProfile?.title ?? "Candidate",
    },
    {
      key: "currentCompany",
      label: "Current company",
      category: "job",
      current: existingProfile?.currentCompany ?? candidate.company,
      parsed: ai.company,
      merged: pickMergedValue(ai.company as string, existingProfile?.currentCompany ?? candidate.company),
    },
    {
      key: "currentRole",
      label: "Current role",
      category: "job",
      current: existingProfile?.currentRole ?? candidate.currentRole,
      parsed: ai.current_role ?? ai.designation,
      merged: pickMergedValue(
        (ai.current_role as string) || (ai.designation as string),
        existingProfile?.currentRole ?? candidate.currentRole,
      ),
    },
    {
      key: "totalExperience",
      label: "Experience",
      category: "job",
      current: existingProfile?.totalExperience ?? candidate.experience,
      parsed: ai.experience,
      merged: pickMergedValue(
        ai.experience as string,
        existingProfile?.totalExperience ?? candidate.experience,
      ),
    },
    {
      key: "noticePeriod",
      label: "Notice period",
      category: "job",
      current: existingProfile?.noticePeriod ?? candidate.noticePeriod,
      parsed: ai.notice_period,
      merged: pickMergedValue(
        ai.notice_period as string,
        existingProfile?.noticePeriod ?? candidate.noticePeriod,
      ),
    },
    {
      key: "highestQualification",
      label: "Highest qualification",
      category: "education",
      current: existingProfile?.highestQualification,
      parsed: ai.degree_level,
      merged: pickMergedValue(
        ai.degree_level as string,
        existingProfile?.highestQualification ?? existingProfile?.degreeLevel,
      ),
    },
    {
      key: "collegeName",
      label: "College / university",
      category: "education",
      current: existingProfile?.collegeName,
      parsed: ai.college ?? ai.university,
      merged: pickMergedValue(
        (ai.college as string) || (ai.university as string),
        existingProfile?.collegeName,
      ),
    },
    {
      key: "course",
      label: "Course",
      category: "education",
      current: existingProfile?.course,
      parsed: ai.course,
      merged: pickMergedValue(ai.course as string, existingProfile?.course),
    },
    {
      key: "graduationYear",
      label: "Graduation year",
      category: "education",
      current: existingProfile?.graduationYear,
      parsed: ai.graduation_year,
      merged: pickMergedValue(ai.graduation_year as string, existingProfile?.graduationYear),
    },
    {
      key: "education",
      label: "Education summary",
      category: "education",
      current: existingProfile?.education ?? candidate.education,
      parsed: normalizedEducation,
      merged: pickMergedValue(normalizedEducation, existingProfile?.education ?? candidate.education),
    },
    {
      key: "skills",
      label: "Skills",
      category: "skills",
      current: existingProfile?.skills ?? candidate.skills,
      parsed: normalizedSkillCsv,
      merged: pickMergedValue(normalizedSkillCsv, existingProfile?.skills ?? candidate.skills),
    },
    {
      key: "linkedinUrl",
      label: "LinkedIn",
      category: "links",
      current: existingProfile?.linkedinUrl ?? candidate.linkedinUrl,
      parsed: ai.linkedin_url ?? ai.linkedinUrl,
      merged: pickMergedValue(
        (ai.linkedin_url as string) || (ai.linkedinUrl as string),
        existingProfile?.linkedinUrl ?? candidate.linkedinUrl,
      ),
    },
    {
      key: "portfolioUrl",
      label: "Portfolio",
      category: "links",
      current: existingProfile?.portfolioUrl ?? candidate.portfolioUrl,
      parsed: ai.portfolio_url ?? ai.portfolioUrl,
      merged: pickMergedValue(
        (ai.portfolio_url as string) || (ai.portfolioUrl as string),
        existingProfile?.portfolioUrl ?? candidate.portfolioUrl,
      ),
    },
    {
      key: "websiteUrl",
      label: "Website",
      category: "links",
      current: existingProfile?.websiteUrl ?? candidate.websiteUrl,
      parsed: ai.website_url ?? ai.websiteUrl,
      merged: pickMergedValue(
        (ai.website_url as string) || (ai.websiteUrl as string),
        existingProfile?.websiteUrl ?? candidate.websiteUrl,
      ),
    },
    {
      key: "preferredLocation",
      label: "Preferred location",
      category: "basic",
      current: existingProfile?.preferredLocation,
      parsed: null,
      merged: existingProfile?.preferredLocation ?? null,
    },
    {
      key: "gender",
      label: "Gender",
      category: "basic",
      current: existingProfile?.gender,
      parsed: null,
      merged: existingProfile?.gender ?? null,
    },
    {
      key: "secondaryEmail",
      label: "Secondary email",
      category: "basic",
      current: existingProfile?.secondaryEmail,
      parsed: ai.secondary_email,
      merged: pickMergedValue(ai.secondary_email as string, existingProfile?.secondaryEmail),
    },
    {
      key: "productService",
      label: "Product / service",
      category: "job",
      current: existingProfile?.productService ?? candidate.productService,
      parsed: ai.product_service,
      merged: pickMergedValue(
        ai.product_service as string,
        existingProfile?.productService ?? candidate.productService,
      ),
    },
    {
      key: "currentDomain",
      label: "Domain",
      category: "job",
      current: existingProfile?.currentDomain ?? candidate.productDomain,
      parsed: ai.product_domain,
      merged: pickMergedValue(
        ai.product_domain as string,
        existingProfile?.currentDomain ?? candidate.productDomain,
      ),
    },
  ];

  const changes = fieldSpecs
    .map((f) => buildChange(f.key, f.label, f.category, f.current, f.parsed, f.merged))
    .filter((c): c is ResumeFieldChange => c !== null);

  const mergedProfile: Record<string, unknown> = {
    candidateId: candidate.candidateId,
    firstName: mergedFirst || existingFirst || "Unknown",
    lastName: mergedLast || existingLast || "Unknown",
    email: pickMergedValue(ai.email as string, existingProfile?.email ?? candidate.email) ?? candidate.email,
    phone:
      pickMergedValue(ai.phone as string, existingProfile?.phone ?? candidate.phone) ??
      existingProfile?.phone ??
      candidate.phone ??
      "Unknown",
    title: professionalTitle ?? existingProfile?.title ?? "Candidate",
    location:
      pickMergedValue(ai.location as string, existingProfile?.location) ??
      existingProfile?.location ??
      "Unknown",
    mobile: pickMergedValue(ai.phone as string, existingProfile?.mobile ?? existingProfile?.phone),
    whatsapp: pickMergedValue(ai.phone as string, existingProfile?.whatsapp),
    primaryEmail: pickMergedValue(ai.email as string, existingProfile?.primaryEmail ?? candidate.email),
    secondaryEmail: pickMergedValue(ai.secondary_email as string, existingProfile?.secondaryEmail),
    currentLocation: pickMergedValue(ai.location as string, existingProfile?.currentLocation),
    preferredLocation: existingProfile?.preferredLocation ?? null,
    dateOfBirth: pickMergedValue(ai.age as string, existingProfile?.dateOfBirth),
    gender: existingProfile?.gender ?? null,
    portfolioUrl: pickMergedValue(
      (ai.portfolio_url as string) || (ai.portfolioUrl as string),
      existingProfile?.portfolioUrl,
    ),
    websiteUrl: pickMergedValue(
      (ai.website_url as string) || (ai.websiteUrl as string),
      existingProfile?.websiteUrl,
    ),
    linkedinUrl: pickMergedValue(
      (ai.linkedin_url as string) || (ai.linkedinUrl as string),
      existingProfile?.linkedinUrl,
    ),
    profilePicture: existingProfile?.profilePicture ?? null,
    bannerImage: existingProfile?.bannerImage ?? null,
    resumeFile: fileUrl,
    resumeText: pickMergedValue(rawText, existingProfile?.resumeText) ?? rawText,
    education: pickMergedValue(normalizedEducation, existingProfile?.education),
    highestQualification: pickMergedValue(
      ai.degree_level as string,
      existingProfile?.highestQualification ?? existingProfile?.degreeLevel,
    ),
    degreeLevel: pickMergedValue(ai.degree_level as string, existingProfile?.degreeLevel),
    collegeName: pickMergedValue(
      (ai.college as string) || (ai.university as string),
      existingProfile?.collegeName,
    ),
    course: pickMergedValue(ai.course as string, existingProfile?.course),
    graduationYear: pickMergedValue(ai.graduation_year as string, existingProfile?.graduationYear),
    skills: pickMergedValue(normalizedSkillCsv, existingProfile?.skills),
    pedigreeLevel: existingProfile?.pedigreeLevel ?? null,
    noticePeriod: pickMergedValue(ai.notice_period as string, existingProfile?.noticePeriod),
    currentCompany: pickMergedValue(ai.company as string, existingProfile?.currentCompany),
    currentRole: pickMergedValue(
      (ai.current_role as string) || (ai.designation as string),
      existingProfile?.currentRole,
    ),
    currentDomain: pickMergedValue(ai.product_domain as string, existingProfile?.currentDomain),
    companyLevel: existingProfile?.companyLevel ?? null,
    productService: pickMergedValue(ai.product_service as string, existingProfile?.productService),
    totalExperience: pickMergedValue(ai.experience as string, existingProfile?.totalExperience),
    salaryRange: existingProfile?.salaryRange ?? null,
    educationHistory: existingProfile?.educationHistory ?? null,
    appliedJobsCount: existingProfile?.appliedJobsCount ?? "0",
  };

  const mergedCandidate: Record<string, unknown> = {
    fullName: parsedFullName ?? candidate.fullName,
    phone: pickMergedValue(ai.phone as string, candidate.phone),
    company: pickMergedValue(ai.company as string, candidate.company),
    designation: pickMergedValue(ai.designation as string, candidate.designation),
    experience: pickMergedValue(ai.experience as string, candidate.experience),
    location: pickMergedValue(ai.location as string, candidate.location),
    skills: pickMergedValue(normalizedSkillCsv, candidate.skills),
    education: pickMergedValue(normalizedEducation, candidate.education),
    currentRole: pickMergedValue(
      (ai.current_role as string) || (ai.designation as string),
      candidate.currentRole,
    ),
    portfolioUrl: pickMergedValue(
      (ai.portfolio_url as string) || (ai.portfolioUrl as string),
      candidate.portfolioUrl,
    ),
    websiteUrl: pickMergedValue(
      (ai.website_url as string) || (ai.websiteUrl as string),
      candidate.websiteUrl,
    ),
    linkedinUrl: pickMergedValue(
      (ai.linkedin_url as string) || (ai.linkedinUrl as string),
      candidate.linkedinUrl,
    ),
    ctc: pickMergedValue(ai.ctc as string, candidate.ctc),
    ectc: pickMergedValue(ai.ectc as string, candidate.ectc),
    noticePeriod: pickMergedValue(ai.notice_period as string, candidate.noticePeriod),
    position: pickMergedValue(ai.position as string, candidate.position),
    employmentType: pickMergedValue(ai.employment_type as string, candidate.employmentType),
    productService: pickMergedValue(ai.product_service as string, candidate.productService),
    productCategory: pickMergedValue(ai.product_category as string, candidate.productCategory),
    productDomain: pickMergedValue(ai.product_domain as string, candidate.productDomain),
    resumeFile: fileUrl,
    resumeText: pickMergedValue(rawText, candidate.resumeText) ?? rawText,
  };

  const skillList = (pickMergedValue(normalizedSkillCsv, existingProfile?.skills ?? candidate.skills) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const fromResume = changes.filter((c) => c.source === "from_resume");
  const retained = changes.filter((c) => c.source === "retained");

  return {
    mergedProfile,
    mergedCandidate,
    skillList,
    changes,
    fromResume,
    retained,
  };
}
