export const CANDIDATE_HELP_FAB_SESSION_KEY = "staffos.candidate.helpFabHidden";

export function resetCandidateHelpFabForNewSession() {
  sessionStorage.removeItem(CANDIDATE_HELP_FAB_SESSION_KEY);
}
