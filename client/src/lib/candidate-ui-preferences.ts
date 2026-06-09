export const CANDIDATE_HELP_FAB_SESSION_KEY = "staffos.candidate.helpFabHidden";

/** Pin modals between header and bottom nav on mobile; body scrolls inside. */
export const CANDIDATE_MOBILE_DIALOG_CLASSES =
  "max-lg:!top-11 max-lg:!bottom-[calc(4rem+env(safe-area-inset-bottom))] max-lg:!left-2 max-lg:!right-2 max-lg:!w-auto max-lg:!max-w-none max-lg:!translate-x-0 max-lg:!translate-y-0 max-lg:z-[180] max-lg:!flex max-lg:!flex-col max-lg:gap-0 max-lg:overflow-hidden max-lg:rounded-[12px] max-lg:shadow-2xl";

/** Content-sized modal, vertically centered on mobile (e.g. job action sheet). */
export const CANDIDATE_MOBILE_CENTERED_DIALOG_CLASSES =
  "max-lg:!top-[50%] max-lg:!bottom-auto max-lg:!left-3 max-lg:!right-3 max-lg:!w-auto max-lg:!max-w-[min(calc(100vw-1.5rem),26rem)] max-lg:!translate-x-0 max-lg:!translate-y-[-50%] max-lg:!h-auto max-lg:!max-h-[min(88dvh,calc(100dvh-5.5rem))] max-lg:z-[181] max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:rounded-[12px] max-lg:shadow-2xl max-lg:!flex max-lg:!flex-col max-lg:gap-0";

/** Restore centered Radix dialog positioning on desktop (paired with mobile classes above). */
export const CANDIDATE_DESKTOP_DIALOG_CLASSES =
  "lg:!top-[50%] lg:!bottom-auto lg:!left-[50%] lg:!right-auto lg:!translate-x-[-50%] lg:!translate-y-[-50%] lg:z-[181]";

/** Blurred backdrop for candidate modals — sits above header (z-30), below notifications (z-240+). */
export const CANDIDATE_DIALOG_OVERLAY_CLASSES =
  "z-[180] bg-slate-900/45 backdrop-blur-md";

export function resetCandidateHelpFabForNewSession() {
  sessionStorage.removeItem(CANDIDATE_HELP_FAB_SESSION_KEY);
}
