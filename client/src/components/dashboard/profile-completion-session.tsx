import React, { useMemo } from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Lock, ArrowRight, Upload, Info } from 'lucide-react';
import type { Profile } from '@shared/schema';

interface ProfileCompletionSessionProps {
  profile: Profile;
  jobPreferences?: any;
  onNavigateToProfile?: () => void;
}

import { calculateProfileCompletion } from '@/lib/profile-utils';

export default function ProfileCompletionSession({ profile, jobPreferences, onNavigateToProfile }: ProfileCompletionSessionProps) {
  if (!profile) return null;

  const { percentage, missing } = calculateProfileCompletion(profile, jobPreferences);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-[2rem] p-8 mt-12 mb-10 border border-blue-100 dark:border-blue-800 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-blue-300/30 transition-colors"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Strength</h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Complete your profile to unlock all job opportunities and let recruiters find you.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-white dark:border-gray-700 min-w-[160px]">
            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{percentage}%</span>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-blue-100/50 dark:bg-gray-700 rounded-full h-3 mb-8 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
  );
}
