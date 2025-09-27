import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { useEmployeeAuth } from '@/contexts/auth-context';
import FileUploadModal from './modals/file-upload-modal';
import { ProfileSettingsModal } from './modals/profile-settings-modal';

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
  bannerImage?: string | null;
  profilePicture?: string | null;
  members?: number;
  tenure?: string;
  qtrsAchieved?: number;
  nextMilestone?: string;
}

interface TeamLeaderProfileHeaderProps {
  profile: TeamLeaderProfile;
}

export default function TeamLeaderProfileHeader({ profile }: TeamLeaderProfileHeaderProps) {
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const employee = useEmployeeAuth();
  
  const { isDarkMode, toggleTheme } = useTheme();

  const handleBannerUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/team-leader/upload/banner', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      // Update profile with new banner image
      const profileResponse = await fetch('/api/team-leader/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bannerImage: result.url }),
      });
      
      if (profileResponse.ok) {
        const updatedProfile = await profileResponse.json();
        setCurrentProfile(updatedProfile);
      }
      
      setShowBannerModal(false);
    } catch (error) {
      console.error('Banner upload failed:', error);
    }
  };

  const handleProfileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/team-leader/upload/profile', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      // Update profile with new profile picture
      const profileResponse = await fetch('/api/team-leader/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePicture: result.url }),
      });
      
      if (profileResponse.ok) {
        const updatedProfile = await profileResponse.json();
        setCurrentProfile(updatedProfile);
      }
      
      setShowProfileModal(false);
    } catch (error) {
      console.error('Profile upload failed:', error);
    }
  };

  const handleDeleteBanner = async () => {
    try {
      const response = await fetch('/api/team-leader/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bannerImage: null }),
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setCurrentProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Banner deletion failed:', error);
    }
  };

  const handleProfileSave = (updatedProfile: any) => {
    setCurrentProfile(updatedProfile);
    // TODO: Send updated profile to API
  };

  // Use employee data from auth context for most current info, fallback to props/local state for images and team-specific data
  const displayProfile = {
    name: employee?.name || profile.name,
    role: employee?.role || profile.role,
    employeeId: employee?.employeeId || profile.employeeId,
    phone: employee?.phone || profile.phone,
    email: employee?.email || profile.email,
    joiningDate: employee?.joiningDate || profile.joiningDate,
    department: employee?.department || profile.department,
    reportingTo: employee?.reportingTo || profile.reportingTo,
    totalContribution: profile.totalContribution,
    bannerImage: currentProfile?.bannerImage || profile.bannerImage,
    profilePicture: currentProfile?.profilePicture || profile.profilePicture,
    // Team leader specific fields
    members: profile.members,
    tenure: profile.tenure,
    qtrsAchieved: profile.qtrsAchieved,
    nextMilestone: profile.nextMilestone,
  };

  return (
    <div className="bg-slate-800 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        {/* Left side - Logo and Company Name */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded">
            <i className="fas fa-chart-line text-white text-xl"></i>
          </div>
          <span className="text-xl font-semibold">Gumlet Marketing Private Limited</span>
        </div>

        {/* Right side - Help and User */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            <i className="fas fa-question-circle"></i>
            <span>Help</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img 
                src={currentProfile.profilePicture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&h=32"}
                alt="User" 
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm">Sasi Kumar</span>
              <i className="fas fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <i className="fas fa-user-circle text-blue-400 text-2xl"></i>
          <span className="text-xl font-semibold" data-testid="text-profile-name-header">
            {currentProfile.name}
          </span>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-8 ml-8">
          <div className="text-center">
            <div className="text-orange-400 text-sm font-medium">Members</div>
            <div className="text-white text-lg font-bold" data-testid="text-members-count">
              {currentProfile.members || 4}
            </div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 text-sm font-medium">Tenure</div>
            <div className="text-white text-lg font-bold" data-testid="text-tenure">
              {currentProfile.tenure || "4.3"} <span className="text-sm font-normal">years</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 text-sm font-medium">Qtrs Achieved</div>
            <div className="text-white text-lg font-bold" data-testid="text-qtrs-achieved">
              {currentProfile.qtrsAchieved || 6}
            </div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 text-sm font-medium">Next Milestone</div>
            <div className="text-white text-lg font-bold" data-testid="text-next-milestone">
              {currentProfile.nextMilestone || "+3"}
            </div>
          </div>
        </div>

        {/* Performance Gauge */}
        <div className="ml-auto">
          <div className="relative w-40 h-20">
            {/* Semi-circular progress bar background */}
            <svg className="w-full h-full" viewBox="0 0 160 80">
              <path
                d="M 20 60 A 60 60 0 0 1 140 60"
                fill="none"
                stroke="#374151"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Progress path - showing good performance */}
              <path
                d="M 20 60 A 60 60 0 0 1 120 35"
                fill="none"
                stroke="#10B981"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Indicator line */}
              <line
                x1="80"
                y1="20"
                x2="120"
                y2="35"
                stroke="#1F2937"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="120" cy="35" r="3" fill="#1F2937" />
            </svg>
            
            {/* Labels */}
            <div className="absolute bottom-0 left-0 text-xs text-red-400">DECLINE</div>
            <div className="absolute bottom-0 right-0 text-xs text-green-400">STABLE</div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400">GROWTH</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FileUploadModal
        open={showBannerModal}
        onOpenChange={setShowBannerModal}
        onUpload={handleBannerUpload}
        title="Upload Banner Image"
        accept="image/*"
        isUploading={false}
      />
      
      <FileUploadModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        onUpload={handleProfileUpload}
        title="Upload Profile Picture"
        accept="image/*"
        isUploading={false}
      />

      <ProfileSettingsModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
    </div>
  );
}