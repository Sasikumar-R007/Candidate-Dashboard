/** Shared 6px-radius styles for modal Close / Cancel and Sign Out actions. */
export const MODAL_BTN_RADIUS = "rounded-[6px]";

export const modalCloseButtonClass =
  `${MODAL_BTN_RADIUS} border border-slate-300 bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700`;

export const modalSignOutButtonClass =
  `${MODAL_BTN_RADIUS} bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700`;
