import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Profile } from '@shared/schema';
import { calculateProfileCompletion } from '@/lib/profile-utils';
import { Edit3 } from 'lucide-react';

interface ProfileStrengthProps {
  profile: Profile;
  jobPreferences?: any;
  onEdit?: () => void;
  editIconOnly?: boolean;
}

export default function ProfileStrength({ profile, jobPreferences, onEdit, editIconOnly }: ProfileStrengthProps) {
  if (!profile) return null;

  const { percentage: strength } = calculateProfileCompletion(profile, jobPreferences);
  const strengthTone =
    strength === 100
      ? {
          ring: "text-green-600",
          badge: "bg-green-600",
          avatar: "bg-green-50 text-green-600",
        }
      : strength >= 41
        ? {
            ring: "text-amber-500",
            badge: "bg-amber-500",
            avatar: "bg-amber-50 text-amber-600",
          }
        : {
            ring: "text-red-500",
            badge: "bg-red-500",
            avatar: "bg-red-50 text-red-600",
          };

  return (
    <div className="flex flex-col items-center mb-3 p-4 bg-white dark:bg-gray-800 rounded-[1rem] shadow-sm border border-gray-100 dark:border-gray-700 w-full max-w-[280px] mx-auto group ring-1 ring-gray-100 dark:ring-gray-800 hover:shadow-md transition-all">
      <div className="relative mb-4">
        <div className="w-28 h-28 relative flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="52"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-gray-50 dark:text-gray-700"
            />
            <circle
              cx="56"
              cy="56"
              r="52"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={326}
              strokeDashoffset={326 - (326 * strength) / 100}
              strokeLinecap="round"
              className={`${strengthTone.ring} transition-all duration-1000 ease-out`}
            />
          </svg>

          <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 shadow-sm">
            <AvatarImage src={profile.profilePicture || ""} className="object-cover" />
            <AvatarFallback className={`${strengthTone.avatar} font-bold text-xl uppercase`}>
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 ${strengthTone.badge} text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 tracking-wider`}>
          {strength}%
        </div>
      </div>

      <div className="text-center mb-0">
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{profile.firstName} {profile.lastName}</h3>
        {editIconOnly && (
          <button
            onClick={onEdit}
            className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-md shadow-blue-200 dark:shadow-none"
          >
            <Edit3 size={12} />
          </button>
        )}
        </div>
        <p className="text-xs font-medium text-gray-400 mb-1">{profile.title || 'Job Seeker'}</p>
      </div>

      {!editIconOnly && (
        <Button
          onClick={onEdit}
          className="w-full bg-[#111827] hover:bg-black text-white dark:bg-white dark:text-black rounded-xl h-12 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-gray-200 dark:shadow-none transition-all active:scale-95"
        >
          EDIT PROFILE
        </Button>
      )}
    </div>
  );
}
