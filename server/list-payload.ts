/** Strip large text fields from list responses (data already omitted at SQL when possible). */

export function stripCandidateListFields<T extends Record<string, unknown>>(row: T): T {
  const { resumeText, resume_text, ...rest } = row as T & {
    resumeText?: unknown;
    resume_text?: unknown;
  };
  return rest as T;
}

export function stripRequirementListFields<T extends Record<string, unknown>>(row: T): T {
  const { jdText, jd_text, ...rest } = row as T & {
    jdText?: unknown;
    jd_text?: unknown;
  };
  return rest as T;
}
