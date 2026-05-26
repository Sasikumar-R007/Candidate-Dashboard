export function isStaffOsTaggedApplication(source: unknown): boolean {
  const normalized = String(source || "").toLowerCase();
  return normalized === "recruiter_tagged" || normalized === "tl_tagged";
}
