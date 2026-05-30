import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, ArrowRight, Upload, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const PROFILE_COMPLETION_INFO =
  'Your completion percentage increases only when you fully complete each profile tab (e.g. Personal Info, Education, Resume)—not from partial or single-field updates.';
import type { Profile } from '@shared/schema';

interface ProfileCompletionSessionProps {
  profile: Profile;
  jobPreferences?: any;
  onNavigateToProfile?: () => void;
}

import { calculateProfileCompletion } from '@/lib/profile-utils';

export default function ProfileCompletionSession({ profile, jobPreferences, onNavigateToProfile }: ProfileCompletionSessionProps) {
  if (!profile) return null;

  const { percentage, sections, missing } = calculateProfileCompletion(profile, jobPreferences);
  const neededForVisibility = Math.max(0, 50 - percentage);
  const doneCount = sections.length - missing.length;

  return (
    <TooltipProvider delayDuration={200}>
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-[2rem] p-8 mt-12 mb-10 border border-blue-100 dark:border-blue-800 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-300/30 transition-colors"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Strength</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-white/80 dark:hover:bg-gray-800 transition-colors"
                    aria-label="How profile completion works"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                  {PROFILE_COMPLETION_INFO}
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Complete your profile to unlock all job opportunities and let recruiters find you.
            </p>
            <div className="mt-3 flex items-baseline gap-2 justify-center md:justify-start">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
              <span className="text-base font-medium text-amber-600">Need {neededForVisibility}% more</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-white dark:border-gray-700 min-w-[160px]">
            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{percentage}%</span>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Completed</span>
          </div>
        </div>

        <div className="w-full bg-blue-100/50 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden relative">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
          <div className="absolute -top-5 text-[10px] font-semibold text-gray-500" style={{ left: "50%" }}>
            50%
          </div>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 mb-6 flex items-center gap-3">
          <Lock size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-900">Reach 50% and recruiters can find and contact you directly.</p>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">What's missing:</h3>
            <div className="flex flex-wrap gap-2">
              {missing.map((section) => (
                <Badge 
                  key={section.id} 
                  variant="outline" 
                  className="bg-white/50 dark:bg-gray-800/50 border-blue-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full font-medium"
                >
                  {section.label} ({section.weight}%)
                </Badge>
              ))}
              {missing.length === 0 && (
                <Badge className="bg-emerald-500 text-white border-0 px-3 py-1 rounded-full font-medium">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> All clear!
                </Badge>
              )}
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 max-w-xl">
              <p className="text-[11px] text-amber-900 mb-1">
                You need at least 50% profile completion to apply for jobs and share details.
              </p>
              <div className="rounded-md bg-green-100 px-2 py-1.5 flex items-center gap-2">
                <Upload size={12} className="text-green-700" />
                <span className="text-[11px] text-green-900">Done {doneCount}/{sections.length} sections</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onNavigateToProfile}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 px-8 rounded-2xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-95 group"
          >
            Complete Profile Now
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
