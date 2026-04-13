import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";

const protectedPrefixes = [
  "/admin",
  "/team-leader",
  "/recruiter-login-2",
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

export default function AuthenticatedNavigationGuard() {
  const { user, isLoading, isVerified } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    const isProtectedRoute = protectedPrefixes.some((prefix) => location.startsWith(prefix));
    if (!user || isLoading || !isVerified || !isProtectedRoute) {
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
