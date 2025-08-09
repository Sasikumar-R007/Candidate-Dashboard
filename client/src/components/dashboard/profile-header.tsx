import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FileUploadModal from './modals/file-upload-modal';
import EditProfileModal from './modals/edit-profile-modal';
import EditBasicInfoModal from './modals/edit-basic-info-modal';
import EditContactModal from './modals/edit-contact-modal';
import { useUpdateProfile, useUploadBanner, useUploadProfile } from '@/hooks/use-profile';
import { useTheme } from '@/contexts/theme-context';
import type { Profile } from '@shared/schema';

interface ProfileHeaderProps {
  profile: Profile;
  showFullHeader?: boolean;
}

export default function ProfileHeader({ profile, showFullHeader = true }: ProfileHeaderProps) {
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();
  
  const updateProfile = useUpdateProfile();
  const uploadBanner = useUploadBanner();
  const uploadProfilePic = useUploadProfile();

  const handleBannerUpload = async (file: File) => {
    try {
      const result = await uploadBanner.mutateAsync(file);
      await updateProfile.mutateAsync({ bannerImage: result.url });
      setShowBannerModal(false);
    } catch (error) {
      console.error('Banner upload failed:', error);
    }
  };

  const handleProfileUpload = async (file: File) => {
    try {
      const result = await uploadProfilePic.mutateAsync(file);
      await updateProfile.mutateAsync({ profilePicture: result.url });
      setShowProfileModal(false);
    } catch (error) {
      console.error('Profile upload failed:', error);
    }
  };

  const handleDeleteBanner = async () => {
    try {
      await updateProfile.mutateAsync({ bannerImage: null });
    } catch (error) {
      console.error('Banner deletion failed:', error);
    }
  };

  if (!showFullHeader) {
    return null;
  }

  return (
    <>
      <div className="relative">
        {/* Banner Background */}
        <div className="h-48 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 relative overflow-hidden">
          {profile.bannerImage && (
            <img 
              src={profile.bannerImage} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Golden Pattern Background */}
          <div className="absolute inset-0 opacity-30">
            <div className="h-full w-full" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 12px)'
            }}></div>
          </div>
          
          {/* Banner Upload Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              onClick={() => setShowBannerModal(true)}
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              size="sm"
            >
              <i className="fas fa-camera mr-2"></i>Change Banner
            </Button>
            {profile.bannerImage && (
              <Button
                onClick={handleDeleteBanner}
                className="bg-red-500/80 backdrop-blur-sm text-white hover:bg-red-600/80"
                size="sm"
              >
                <i className="fas fa-trash mr-2"></i>Delete
              </Button>
            )}
          </div>

          {/* Profile Picture - Centered on Banner Edge */}
          <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2">
            <div className="relative">
              <img 
                src={profile.profilePicture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"} 
                alt="Profile picture" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button 
                onClick={() => setShowProfileModal(true)}
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-camera text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white dark:bg-gray-800 mx-6 pt-20 pb-8 px-6 shadow-lg rounded-b-xl relative z-10">
          <div className="flex items-start justify-between mb-6">
            {/* Left side - Applied Jobs */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Applied Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.appliedJobsCount}</p>
            </div>

            {/* Right side - Social Icons and Theme Toggle */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="text-gray-400 hover:text-gray-800 transition-colors p-2"
                title="Toggle theme"
              >
                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
              </button>
              
              {/* Social Media Icons */}
              <div className="flex gap-3">
                <a href={profile.linkedinUrl || '#'} className="text-gray-400 hover:text-blue-600 transition-colors">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-800 transition-colors">
                  <i className="fab fa-github text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Profile Info - Centered */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{profile.firstName} {profile.lastName}</h2>
            <div className="flex items-center justify-center gap-2 mb-3">
              <p className="text-lg text-gray-700 dark:text-gray-300">{profile.title}</p>
              <span className="text-gray-400 dark:text-gray-500">•</span>
              <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center">
                <i className="fas fa-map-marker-alt mr-1"></i>
                {profile.location}
              </p>
            </div>
            
            {/* Contact Information */}
            <div className="flex items-center justify-center gap-6 mb-4 text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <i className="fas fa-phone mr-2"></i>
                <span>{profile.phone}</span>
              </span>
              <span className="flex items-center">
                <i className="fas fa-envelope mr-2"></i>
                <span>{profile.email}</span>
              </span>
            </div>

            {/* Education & Portfolio */}
            <div className="text-gray-600 dark:text-gray-400 mb-4">
              <p className="mb-1">{profile.education}</p>
              <p>Portfolio - <a href={profile.portfolio || '#'} className="text-blue-600 dark:text-blue-400 hover:underline">{profile.portfolio}</a></p>
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
        isUploading={uploadBanner.isPending}
      />
      
      <FileUploadModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        onUpload={handleProfileUpload}
        title="Upload Profile Picture"
        accept="image/*"
        isUploading={uploadProfilePic.isPending}
      />

      <EditProfileModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        profile={profile}
      />

      <EditBasicInfoModal
        open={showBasicInfoModal}
        onOpenChange={setShowBasicInfoModal}
        profile={profile}
      />

      <EditContactModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
        profile={profile}
      />
    </>
  );
}
