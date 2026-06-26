export const RECRUITER_DASHBOARD_TAB_KEY = "recruiterDashboardSidebarTab";

export type RecruiterNavigate = (
  path: string,
  options?: { replace?: boolean; state?: unknown },
) => void;

export function saveRecruiterDashboardTab(tab: string) {
  sessionStorage.setItem(RECRUITER_DASHBOARD_TAB_KEY, tab);
}

/** Open a TA satellite page while preserving the current dashboard sidebar tab. */
export function navigateToRecruiterSatellitePage(
  navigate: RecruiterNavigate,
  path: string,
  currentTab: string,
) {
  saveRecruiterDashboardTab(currentTab);
  navigate(path);
}

/** Return to the TA dashboard; prefer one step back so browser history stays usable. */
export function navigateBackToRecruiterDashboard(navigate: RecruiterNavigate) {
  if (!sessionStorage.getItem(RECRUITER_DASHBOARD_TAB_KEY)) {
    saveRecruiterDashboardTab("dashboard");
  }

  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  navigate("/recruiter");
}
