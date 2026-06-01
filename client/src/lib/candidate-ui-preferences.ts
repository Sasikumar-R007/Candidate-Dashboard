export const CANDIDATE_HELP_FAB_SESSION_KEY = "staffos.candidate.helpFabHidden";

/** Pin modals between header and bottom nav on mobile; body scrolls inside. */
export const CANDIDATE_MOBILE_DIALOG_CLASSES =
  "max-lg:!top-14 max-lg:!bottom-[calc(4.75rem+env(safe-area-inset-bottom))] max-lg:!left-3 max-lg:!right-3 max-lg:!w-auto max-lg:!max-w-none max-lg:!translate-x-0 max-lg:!translate-y-0 max-lg:z-[200] max-lg:!flex max-lg:!flex-col max-lg:gap-0 max-lg:overflow-hidden max-lg:rounded-[12px] max-lg:shadow-2xl";

/** Restore centered Radix dialog positioning on desktop (paired with mobile classes above). */
export const CANDIDATE_DESKTOP_DIALOG_CLASSES =
  "lg:!top-[50%] lg:!bottom-auto lg:!left-[50%] lg:!right-auto lg:!translate-x-[-50%] lg:!translate-y-[-50%] lg:z-50";

export function resetCandidateHelpFabForNewSession() {
  sessionStorage.removeItem(CANDIDATE_HELP_FAB_SESSION_KEY);
}
