import React, { useMemo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Profile } from '@shared/schema';
import { calculateProfileCompletion } from '@/lib/profile-utils';

interface ProfileCompletionWidgetProps {
  profile: Profile;
  jobPreferences?: any;
}

export default function ProfileCompletionWidget({ profile, jobPreferences }: ProfileCompletionWidgetProps) {
  const { sections, percentage: completionPercentage } = useMemo(() => {
    return calculateProfileCompletion(profile, jobPreferences);
  }, [profile, jobPreferences]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 w-full max-w-sm sticky top-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-6">
        Complete your profile
      </h3>

      <div className="relative flex items-center justify-center mb-8">
        {/* Simple SVG Circular Progress */}
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            className="text-gray-100 dark:text-gray-700"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
            r="70"
            cx="80"
            cy="80"
          />
          <circle
            className="text-emerald-500"
            strokeWidth="12"
            strokeDasharray={440}
            strokeDashoffset={440 - (440 * completionPercentage) / 100}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="70"
            cx="80"
            cy="80"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {completionPercentage}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="transition-transform duration-200 group-hover:scale-110">
                {section.isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <span className={`text-sm font-medium ${section.isDone ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                {section.label}
              </span>
            </div>
            <span className={`text-xs font-bold ${section.isDone ? 'text-gray-400 dark:text-gray-600' : 'text-emerald-500'}`}>
              {section.isDone ? `${section.weight}%` : `+${section.weight}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
