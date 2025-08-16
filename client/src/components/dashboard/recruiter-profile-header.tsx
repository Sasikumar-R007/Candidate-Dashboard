import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from "@/hooks/use-toast";
import FileUploadModal from './modals/file-upload-modal';
import TeamLeaderEditProfileModal from './modals/team-leader-edit-profile-modal';

interface RecruiterProfile {
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      {/* Banner Section */}
      <div className="relative h-32 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-lg overflow-hidden">
        {displayProfile.bannerImage && (
          <img 
            src={displayProfile.bannerImage} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white text-gray-700 text-xs px-3 py-1"
            onClick={() => setShowBannerModal(true)}
          >
            <i className="fas fa-camera mr-1"></i>
            Change Banner
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              {displayProfile.profilePicture ? (
                <img 
                  src={displayProfile.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <i className="fas fa-user text-gray-400 text-2xl"></i>
              )}
            </div>
            <button
              onClick={() => setShowProfileModal(true)}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <i className="fas fa-camera text-xs text-gray-600 dark:text-gray-400"></i>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <i className="fas fa-sun text-yellow-500"></i>
              ) : (
                <i className="fas fa-moon text-gray-600"></i>
              )}
            </button>
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <i className="fab fa-linkedin text-blue-600"></i>
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              className="text-xs"
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          {/* Name and Role */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayProfile.name}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {displayProfile.role}
              </span>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                {displayProfile.employeeId}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex justify-center items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <i className="fas fa-phone text-red-500"></i>
              <span>{displayProfile.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <i className="fas fa-envelope text-gray-500"></i>
              <span>{displayProfile.email}</span>
            </div>
          </div>

          {/* Additional Details */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <div>Joining Date: {displayProfile.joiningDate}</div>
            <div>Reporting to: {displayProfile.reportingTo}</div>
          </div>
        </div>

        {/* Total Contribution */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Contribution</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ₹{displayProfile.totalContribution}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
        onUpload={handleBannerUpload}
        title="Upload Banner Image"
        acceptedTypes="image/*"
      />

      <FileUploadModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpload={handleProfilePictureUpload}
        title="Upload Profile Picture"
        acceptedTypes="image/*"
      />

      <TeamLeaderEditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={displayProfile}
        onUpdate={setCurrentProfile}
        apiEndpoint="/api/recruiter/profile"
      />
    </div>
  );
}