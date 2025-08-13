import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';

interface TeamLeaderProfile {
  name: string;
  role: string;
  employeeId: string;
  phone: string;
  email: string;
  joiningDate: string;
  department: string;
  reportingTo: string;
  totalContribution: string;
}

interface TeamLeaderProfileHeaderProps {
  profile: TeamLeaderProfile;
}

export default function TeamLeaderProfileHeader({ profile }: TeamLeaderProfileHeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="relative">
      {/* Banner Background */}
      <div className="h-56 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 relative">
        {/* Golden Pattern Background */}
        <div className="absolute inset-0 opacity-30">
          <div 
            className="h-full w-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 12px)'
            }}
          ></div>
        </div>

        {/* Banner Upload Controls */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <Button
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            size="sm"
            data-testid="button-change-banner"
          >
            <i className="fas fa-camera mr-2"></i>Change Banner
          </Button>
        </div>

        {/* Profile Picture */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 z-30">
          <div className="relative">
            <img 
              src="/api/placeholder/128/128"
              alt="Profile picture" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button 
              className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              data-testid="button-change-profile-pic"
            >
              <i className="fas fa-camera text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white dark:bg-gray-800 mx-6 pt-6 pb-8 px-6 shadow-lg rounded-b-xl relative z-10 mt-0">
        <div className="flex items-start justify-between mb-6">
          {/* Left side - Total Contribution */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Contribution</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="text-total-contribution-display">
              {profile.totalContribution}
            </p>
          </div>

          {/* Right side - Theme Toggle and Edit Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="text-gray-400 hover:text-gray-800 transition-colors p-2"
              title="Toggle theme"
              data-testid="button-toggle-theme"
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
            </button>

            <Button variant="outline" size="sm" data-testid="button-edit-profile-header">
              <i className="fas fa-edit mr-2"></i>
              Edit profile
            </Button>
          </div>
        </div>

        {/* Profile Info - Centered */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" data-testid="text-profile-name-header">
            {profile.name}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-lg text-gray-700 dark:text-gray-300" data-testid="text-profile-role-header">
              {profile.role}
            </p>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <p className="text-lg text-gray-600 dark:text-gray-400" data-testid="text-profile-employee-id">
              {profile.employeeId}
            </p>
          </div>

          {/* Contact Information */}
          <div className="flex items-center justify-center gap-6 mb-2 text-gray-600 dark:text-gray-400">
            <span className="flex items-center" data-testid="text-profile-phone-header">
              <i className="fas fa-phone mr-2"></i>
              <span>{profile.phone}</span>
            </span>
            <span className="flex items-center" data-testid="text-profile-email-header">
              <i className="fas fa-envelope mr-2"></i>
              <span>{profile.email}</span>
            </span>
          </div>

          {/* Work Details */}
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center justify-center gap-4 text-sm">
              <span data-testid="text-joining-date-header">
                <i className="fas fa-calendar mr-1"></i>
                Joined: {profile.joiningDate}
              </span>
              <span data-testid="text-department-header">
                <i className="fas fa-building mr-1"></i>
                {profile.department}
              </span>
              <span data-testid="text-reporting-to-header">
                <i className="fas fa-user-tie mr-1"></i>
                Reports to: {profile.reportingTo}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}