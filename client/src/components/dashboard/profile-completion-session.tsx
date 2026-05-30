import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Profile } from '@shared/schema';
import { calculateProfileCompletion } from '@/lib/profile-utils';

const PROFILE_COMPLETION_INFO =
  'Your completion percentage increases only when you fully complete each profile tab (e.g. Personal Info, Education, Resume)—not from partial or single-field updates.';

interface ProfileCompletionSessionProps {
  profile: Profile;
  jobPreferences?: any;
  onNavigateToProfile?: () => void;
}

export default function ProfileCompletionSession({ profile, jobPreferences, onNavigateToProfile }: ProfileCompletionSessionProps) {
  if (!profile) return null;

  const { percentage, missing } = calculateProfileCompletion(profile, jobPreferences);
  const neededForVisibility = Math.max(0, 50 - percentage);
  const isRecruiterVisible = percentage >= 50;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mt-10 mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Strength</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="How profile completion works"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                  {PROFILE_COMPLETION_INFO}
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isRecruiterVisible
                ? 'Your profile is visible to recruiters. Keep it updated for better matches.'
                : `Complete ${neededForVisibility}% more of your profile to apply for jobs and be visible to recruiters.`}
            </p>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white shrink-0 tabular-nums">
            {percentage}%
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span className={isRecruiterVisible ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
              {isRecruiterVisible ? 'Recruiter visible' : '50% needed to apply'}
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isRecruiterVisible ? 'bg-emerald-500' : 'bg-blue-600'}`}
              style={{ width: `${percentage}%` }}
            />
            <div className="absolute top-0 bottom-0 w-px bg-amber-400/80" style={{ left: '50%' }} />
          </div>
        </div>

        {missing.length > 0 && onNavigateToProfile && (
          <div className="mt-5 flex justify-end">
            <Button
              onClick={onNavigateToProfile}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Complete Profile
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
