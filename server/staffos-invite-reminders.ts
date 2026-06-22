import { and, eq, inArray, isNull, lt, or, sql } from "drizzle-orm";
import { jobApplications, candidates } from "@shared/schema";
import { STAFFOS_INVITE_REMINDER_MS } from "@shared/staffos-onboard";
import { db } from "./db";
import type { IStorage } from "./storage";
import { isEphemeralRecruiterProfileId } from "./candidate-job-application-utils";

const REMINDER_CHECK_INTERVAL_MS = 15 * 60 * 1000;

export async function processStaffosInviteReminders(storage: IStorage): Promise<number> {
  const cutoff = new Date(Date.now() - STAFFOS_INVITE_REMINDER_MS);

  const pendingRows = await db
    .select({
      applicationId: jobApplications.id,
      candidateName: jobApplications.candidateName,
      candidateEmail: jobApplications.candidateEmail,
      jobTitle: jobApplications.jobTitle,
      company: jobApplications.company,
      ownerEmployeeId: jobApplications.ownerEmployeeId,
      profileId: jobApplications.profileId,
    })
    .from(jobApplications)
    .where(
      and(
        isNull(jobApplications.staffosInviteReminderSentAt),
        sql`${jobApplications.staffosInviteSentAt} IS NOT NULL`,
        lt(jobApplications.staffosInviteSentAt, cutoff),
        eq(jobApplications.isCandidateConfirmed, false),
        or(
          eq(jobApplications.source, "recruiter_tagged"),
          eq(jobApplications.source, "tl_tagged"),
        ),
      ),
    )
    .limit(50);

  if (pendingRows.length === 0) {
    return 0;
  }

  const profileIds = [
    ...new Set(
      pendingRows
        .map((row) => row.profileId)
        .filter((id): id is string => Boolean(id) && !isEphemeralRecruiterProfileId(id)),
    ),
  ];

  const candidateLoginMap = new Map<string, string | null>();
  if (profileIds.length > 0) {
    const candidateRows = await db
      .select({ id: candidates.id, lastLoginAt: candidates.lastLoginAt })
      .from(candidates)
      .where(inArray(candidates.id, profileIds));
    for (const row of candidateRows) {
      candidateLoginMap.set(row.id, row.lastLoginAt ?? null);
    }
  }

  const emails = [
    ...new Set(
      pendingRows
        .map((row) => row.candidateEmail?.trim().toLowerCase())
        .filter((email): email is string => Boolean(email)),
    ),
  ];

  const emailLoginMap = new Map<string, string | null>();
  for (const email of emails) {
    const candidate = await storage.getCandidateByEmail(email);
    emailLoginMap.set(email, candidate?.lastLoginAt ?? null);
  }

  let sent = 0;

  for (const row of pendingRows) {
    const profileLogin =
      row.profileId && !isEphemeralRecruiterProfileId(row.profileId)
        ? candidateLoginMap.get(row.profileId) ?? null
        : null;
    const emailKey = row.candidateEmail?.trim().toLowerCase() || "";
    const emailLogin = emailKey ? emailLoginMap.get(emailKey) ?? null : null;
    const hasLoggedIn = Boolean(profileLogin || emailLogin);

    if (hasLoggedIn) {
      await db
        .update(jobApplications)
        .set({ staffosInviteReminderSentAt: new Date() })
        .where(eq(jobApplications.id, row.applicationId));
      continue;
    }

    const recruiterId = row.ownerEmployeeId;
    if (!recruiterId) {
      continue;
    }

    const candidateLabel = row.candidateName || row.candidateEmail || "Candidate";
    const roleLabel = row.jobTitle || "the role";
    const companyLabel = row.company ? ` at ${row.company}` : "";
    const hours = STAFFOS_INVITE_REMINDER_MS / (60 * 60 * 1000);
    const title = "Candidate has not logged in";
    const message = `${candidateLabel} has not logged in to StaffOS ${hours} hours after your onboard invite for ${roleLabel}${companyLabel}. You can resend the welcome email.`;

    try {
      await storage.createNotification({
        userId: recruiterId,
        type: "candidate_staffos_invite_expired",
        title,
        message,
        status: "unread",
        relatedJobId: row.applicationId,
        createdAt: new Date().toISOString(),
        readAt: null,
      } as any);
    } catch (error) {
      console.warn("[staffos-invite-reminders] notification failed:", error);
      continue;
    }

    await db
      .update(jobApplications)
      .set({ staffosInviteReminderSentAt: new Date() })
      .where(eq(jobApplications.id, row.applicationId));

    sent += 1;
  }

  return sent;
}

export function startStaffosInviteReminderScheduler(storage: IStorage): void {
  const tick = () => {
    void processStaffosInviteReminders(storage).catch((error) => {
      console.error("[staffos-invite-reminders] scheduler error:", error);
    });
  };

  setTimeout(tick, 30_000);
  setInterval(tick, REMINDER_CHECK_INTERVAL_MS);
}
