import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from "@/hooks/use-toast";
import FileUploadModal from './modals/file-upload-modal';
import TeamLeaderEditProfileModal from './modals/team-leader-edit-profile-modal';

interface RecruiterProfile {
  id: string;
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
}

interface RecruiterProfileHeaderProps {
  profile: RecruiterProfile;
}

export default function RecruiterProfileHeader({ profile }: RecruiterProfileHeaderProps) {
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const { toast } = useToast();
  
  const { isDarkMode, toggleTheme } = useTheme();

  const handleBannerUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/recruiter/upload/banner', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      // Update profile with new banner image
      const profileResponse = await fetch('/api/recruiter/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannerImage: result.url,
        }),
      });
      
      if (!profileResponse.ok) {
        throw new Error('Profile update failed');
      }
      
      const updatedProfile = await profileResponse.json();
      setCurrentProfile(updatedProfile);
      setShowBannerModal(false);
      
      toast({
        title: "Success",
        description: "Banner image uploaded successfully!",
      });
    } catch (error) {
      console.error('Banner upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload banner image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfilePictureUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/recruiter/upload/profile', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      // Update profile with new profile picture
      const profileResponse = await fetch('/api/recruiter/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profilePicture: result.url,
        }),
      });
      
      if (!profileResponse.ok) {
        throw new Error('Profile update failed');
      }
      
      const updatedProfile = await profileResponse.json();
      setCurrentProfile(updatedProfile);
      setShowProfileModal(false);
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      });
    } catch (error) {
      console.error('Profile picture upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  const displayProfile = currentProfile || profile;

  return (
    <div className="relative">
      {/* Banner Background */}
      <div className="h-56 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 relative">
        {displayProfile.bannerImage && (
          <img 
            src={displayProfile.bannerImage} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        )}

        {/* Orange Pattern Background */}
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
            onClick={() => setShowBannerModal(true)}
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
              src={
                displayProfile.profilePicture ||
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150"
              }
              alt="Profile picture" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button 
              onClick={() => setShowProfileModal(true)}
              className="absolute -bottom-1 -right-1 bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors"
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
              ₹{displayProfile.totalContribution}
            </p>
          </div>

          {/* Right side - Social Icons, Theme Toggle and Edit Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="text-gray-400 hover:text-gray-800 transition-colors p-2"
              title="Toggle theme"
              data-testid="button-toggle-theme"
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
            </button>

            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors" data-testid="link-linkedin">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowEditModal(true)}
              data-testid="button-edit-profile-header"
            >
              <i className="fas fa-edit mr-2"></i>
              Edit profile
            </Button>
          </div>
        </div>

        {/* Profile Info - Centered */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2" data-testid="text-profile-name-header">
            {displayProfile.name}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-lg text-gray-700 dark:text-gray-300" data-testid="text-profile-role-header">
              {displayProfile.role}
            </p>
            <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded font-medium">
              {displayProfile.employeeId}
            </span>
          </div>

          {/* Contact Information */}
          <div className="flex items-center justify-center gap-6 mb-2 text-gray-600 dark:text-gray-400">
            <span className="flex items-center" data-testid="text-profile-phone-header">
              <i className="fas fa-phone mr-2"></i>
              <span>{displayProfile.phone}</span>
            </span>
            <span className="flex items-center" data-testid="text-profile-email-header">
              <i className="fas fa-envelope mr-2"></i>
              <span>{displayProfile.email}</span>
            </span>
          </div>

          {/* Work Details */}
          <div className="text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center justify-center gap-4 text-sm mb-1">
              <span data-testid="text-joining-date-header">
                Joined: {displayProfile.joiningDate}
              </span>
              <span data-testid="text-department-header">
                Department: {displayProfile.department}
              </span>
            </div>
            <div className="text-sm">
              <span data-testid="text-reporting-to-header">
                Reports to: {displayProfile.reportingTo}
              </span>
            </div>
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
      />

      <FileUploadModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        onUpload={handleProfilePictureUpload}
        title="Upload Profile Picture"
        accept="image/*"
      />

      <TeamLeaderEditProfileModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        profile={displayProfile}
        onUpdate={setCurrentProfile}
        apiEndpoint="/api/recruiter/profile"
      />
    </div>
  );
}