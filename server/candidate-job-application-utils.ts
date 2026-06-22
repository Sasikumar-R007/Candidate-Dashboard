import type { Candidate, JobApplication } from "@shared/schema";
import { isStaffOsTaggedSource as isStaffOsTaggedSourceShared } from "@shared/staffos-onboard";
import { db } from "./db";
import { jobApplications } from "@shared/schema";
import { and, eq, ne, or, sql } from "drizzle-orm";

export function isStaffOsTaggedSource(source: unknown): boolean {
  return isStaffOsTaggedSourceShared(source);
}

export function isEphemeralRecruiterProfileId(profileId: string | null | undefined): boolean {
  return typeof profileId === "string" && profileId.startsWith("recruiter-tagged-");
}

export function applicationBelongsToCandidate(
  application: { profileId?: string | null; candidateEmail?: string | null },
  candidate: Pick<Candidate, "id" | "email">,
): boolean {
  if (application.profileId === candidate.id) return true;
  const appEmail = application.candidateEmail?.trim().toLowerCase();
  const candidateEmail = candidate.email?.trim().toLowerCase();
  return Boolean(appEmail && candidateEmail && appEmail === candidateEmail);
}

/** Attach orphan TA/TL tags (legacy profile_id) to the registered candidate row. */
export async function linkStaffOsTaggedApplicationsToCandidate(
  candidateId: string,
  email: string,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;

  try {
    await db
      .update(jobApplications)
      .set({ profileId: candidateId })
      .where(
        and(
          sql`LOWER(${jobApplications.candidateEmail}) = ${normalized}`,
          ne(jobApplications.profileId, candidateId),
          or(
            eq(jobApplications.source, "recruiter_tagged"),
            eq(jobApplications.source, "tl_tagged"),
          ),
        ),
      );
  } catch (error) {
    console.error("[linkStaffOsTaggedApplicationsToCandidate]", error);
  }
}

export function mergeJobApplicationsById(
  ...lists: JobApplication[][]
): JobApplication[] {
  const map = new Map<string, JobApplication>();
  for (const list of lists) {
    for (const app of list) {
      if (app?.id) map.set(app.id, app);
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const aDate = a.appliedDate ? new Date(a.appliedDate as any).getTime() : 0;
    const bDate = b.appliedDate ? new Date(b.appliedDate as any).getTime() : 0;
    return bDate - aDate;
  });
}
