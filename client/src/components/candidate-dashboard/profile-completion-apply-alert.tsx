import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@shared/schema";
import {
  calculateProfileCompletion,
  canCandidateApplyToJobs,
  getProfileCompletionApplyBlockedMessage,
  MIN_PROFILE_COMPLETION_TO_APPLY,
} from "@/lib/profile-utils";
import { cn } from "@/lib/utils";

type ProfileCompletionApplyAlertProps = {
  profile: Profile;
  jobPreferences?: unknown;
  onNavigateToProfile?: () => void;
  variant?: "banner" | "card" | "inline";
  className?: string;
};

export default function ProfileCompletionApplyAlert({
  profile,
  jobPreferences,
  onNavigateToProfile,
  variant = "banner",
  className,
}: ProfileCompletionApplyAlertProps) {
  const { percentage } = calculateProfileCompletion(profile, jobPreferences);

  if (canCandidateApplyToJobs(percentage)) {
    return null;
  }

  const message = getProfileCompletionApplyBlockedMessage(percentage);

  if (variant === "inline") {
    return (
      <p className={cn("text-[10px] font-semibold text-amber-700 leading-snug text-center px-1", className)}>
        {MIN_PROFILE_COMPLETION_TO_APPLY}% required to apply · You are at {percentage}%
      </p>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950",
          className,
        )}
        role="alert"
      >
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold leading-snug">{message}</p>
          {onNavigateToProfile ? (
            <Button
              type="button"
              size="sm"
              onClick={onNavigateToProfile}
              className="h-8 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold"
            >
              Complete profile
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      role="alert"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-amber-950">Complete your profile to apply</p>
          <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 sm:pl-2">
        <span className="text-lg font-black tabular-nums text-amber-700">{percentage}%</span>
        {onNavigateToProfile ? (
          <Button
            type="button"
            size="sm"
            onClick={onNavigateToProfile}
            className="h-9 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold whitespace-nowrap"
          >
            Go to profile
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
