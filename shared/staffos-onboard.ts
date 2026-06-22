const STAFFOS_TAGGED_SOURCES = new Set(["recruiter_tagged", "tl_tagged"]);

/** Hours before TA can resend onboard invite and receives a no-login reminder. */
export const STAFFOS_INVITE_REMINDER_HOURS = 3;

export const STAFFOS_INVITE_REMINDER_MS = STAFFOS_INVITE_REMINDER_HOURS * 60 * 60 * 1000;

export function isStaffOsTaggedSource(source: unknown): boolean {
  return STAFFOS_TAGGED_SOURCES.has(String(source || "").toLowerCase());
}

export function candidateHasLoggedIntoStaffOS(lastLoginAt?: Date | string | null): boolean {
  if (!lastLoginAt) return false;
  const ts = new Date(lastLoginAt).getTime();
  return Number.isFinite(ts);
}

export type StaffosOnboardGateInput = {
  source?: string | null;
  isCandidateConfirmed?: boolean | null;
  staffosInviteSentAt?: Date | string | null;
  candidateLastLoginAt?: Date | string | null;
};

export type StaffosOnboardGate = {
  isUsingStaffOS: boolean;
  canUpdateStatus: boolean;
  canSendOnboardInvite: boolean;
  onboardInvitePending: boolean;
  awaitingCandidateAcceptance: boolean;
};

export function computeStaffosOnboardGate(input: StaffosOnboardGateInput): StaffosOnboardGate {
  const isTagged = isStaffOsTaggedSource(input.source);
  const isConfirmed = input.isCandidateConfirmed !== false;
  const hasLoggedIn = candidateHasLoggedIntoStaffOS(input.candidateLastLoginAt);
  const inviteSentAtMs = input.staffosInviteSentAt
    ? new Date(input.staffosInviteSentAt).getTime()
    : null;
  const hasInviteSent = inviteSentAtMs !== null && Number.isFinite(inviteSentAtMs);
  const inviteAgeMs = hasInviteSent ? Date.now() - inviteSentAtMs! : 0;
  const inviteWithinWindow = hasInviteSent && inviteAgeMs < STAFFOS_INVITE_REMINDER_MS;

  if (!isTagged) {
    return {
      isUsingStaffOS: hasLoggedIn,
      canUpdateStatus: true,
      canSendOnboardInvite: false,
      onboardInvitePending: false,
      awaitingCandidateAcceptance: false,
    };
  }

  const onboardInvitePending = hasInviteSent && !hasLoggedIn && !isConfirmed && inviteWithinWindow;
  const canSendOnboardInvite =
    !isConfirmed &&
    !hasLoggedIn &&
    (!hasInviteSent || !inviteWithinWindow);

  return {
    isUsingStaffOS: hasLoggedIn,
    canUpdateStatus: isConfirmed,
    canSendOnboardInvite,
    onboardInvitePending,
    awaitingCandidateAcceptance: !isConfirmed,
  };
}
