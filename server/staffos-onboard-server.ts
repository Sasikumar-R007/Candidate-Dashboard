import type { Candidate, JobApplication } from "@shared/schema";
import { candidates } from "@shared/schema";
import { computeStaffosOnboardGate } from "@shared/staffos-onboard";
import { eq } from "drizzle-orm";
import { isEphemeralRecruiterProfileId } from "./candidate-job-application-utils";
import { db } from "./db";
import type { IStorage } from "./storage";

export async function recordCandidateStaffOSLogin(candidateDbId: string): Promise<void> {
  if (!candidateDbId) return;
  try {
    await db
      .update(candidates)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(candidates.id, candidateDbId));
  } catch (error) {
    console.warn("[recordCandidateStaffOSLogin]", error);
  }
}

export async function resolveCandidateForApplication(
  storage: IStorage,
  application: JobApplication,
  candidatesByProfileId?: Map<string, Candidate>,
): Promise<Candidate | null> {
  if (application.profileId && !isEphemeralRecruiterProfileId(application.profileId)) {
    const mapped = candidatesByProfileId?.get(application.profileId);
    if (mapped) return mapped;
    const byId = await storage.getCandidateById(application.profileId);
    if (byId) return byId;
  }

  const email = application.candidateEmail?.trim().toLowerCase();
  if (email) {
    return (await storage.getCandidateByEmail(email)) ?? null;
  }

  return null;
}

export function applyOnboardGateToApplication(
  app: Record<string, unknown>,
  candidate: Candidate | null,
): void {
  const gate = computeStaffosOnboardGate({
    source: app.source as string | null | undefined,
    isCandidateConfirmed: app.isCandidateConfirmed as boolean | null | undefined,
    staffosInviteSentAt: app.staffosInviteSentAt as string | Date | null | undefined,
    candidateLastLoginAt: candidate?.lastLoginAt ?? null,
  });

  app.isUsingStaffOS = gate.isUsingStaffOS;
  app.canUpdateStatus = gate.canUpdateStatus;
  app.canSendOnboardInvite = gate.canSendOnboardInvite;
  app.onboardInvitePending = gate.onboardInvitePending;
  app.awaitingCandidateAcceptance = gate.awaitingCandidateAcceptance;
}

export async function assertRecruiterCanUpdateApplicationStatus(
  storage: IStorage,
  application: JobApplication,
): Promise<{ allowed: true } | { allowed: false; message: string }> {
  const candidate = await resolveCandidateForApplication(storage, application);
  const gate = computeStaffosOnboardGate({
    source: application.source,
    isCandidateConfirmed: application.isCandidateConfirmed,
    staffosInviteSentAt: application.staffosInviteSentAt ?? null,
    candidateLastLoginAt: candidate?.lastLoginAt ?? null,
  });

  if (!gate.canUpdateStatus) {
    return {
      allowed: false,
      message:
        "Cannot update status until the candidate logs in to StaffOS and accepts the application.",
    };
  }

  return { allowed: true };
}
