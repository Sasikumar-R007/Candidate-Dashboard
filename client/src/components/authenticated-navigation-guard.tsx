import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

const protectedPrefixes = [
  "/admin",
  "/team-leader",
  "/recruiter",
  "/client",
  "/support-dashboard",
  "/candidate",
  "/source-resume",
  "/recruiter-active-jobs",
  "/recruiter-new-applications",
  "/recruiter-all-candidates",
  "/recruiter-applicants",
  "/archives",
  "/master-database",
  "/candidate-profile",
  "/chat",
];

/** Child/detail routes where browser back should return to the parent screen. */
const ROUTES_WITH_NATURAL_BACK = new Set([
  "/recruiter-active-jobs",
  "/recruiter-new-applications",
  "/recruiter-all-candidates",
  "/recruiter-applicants",
  "/source-resume",
  "/archives",
  "/master-database",
  "/admin/consent-logs",
]);

function allowsNaturalBackNavigation(location: string): boolean {
  return (
    ROUTES_WITH_NATURAL_BACK.has(location) ||
    location.startsWith("/candidate-profile/")
  );
}

export default function AuthenticatedNavigationGuard() {
  const { user, isLoading, isVerified } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const isProtectedRoute = protectedPrefixes.some((prefix) => location.startsWith(prefix));
    const shouldTrapBrowserBack =
      isProtectedRoute && !allowsNaturalBackNavigation(location);

    if (!user || isLoading || !isVerified || !shouldTrapBrowserBack) {
      return;
    }

    const guardState = { staffosBackGuard: true, path: location };
    window.history.replaceState({ ...(window.history.state || {}), staffosProtectedBase: true, path: location }, "", location);
    window.history.pushState(guardState, "", location);

    const handlePopState = () => {
      window.history.pushState(guardState, "", location);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [user, isLoading, isVerified, location]);

  return null;
}
