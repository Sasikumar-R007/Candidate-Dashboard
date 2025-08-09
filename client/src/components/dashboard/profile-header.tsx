import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FileUploadModal from './modals/file-upload-modal';
import EditProfileModal from './modals/edit-profile-modal';
import { useUpdateProfile, useUploadBanner, useUploadProfile } from '@/hooks/use-profile';
import type { Profile } from '@shared/schema';

interface ProfileHeaderProps {
  profile: Profile;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
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

  return (
    <>
      <div className="relative">
        {/* Banner Background */}
        <div className="h-48 bg-gradient-to-r from-golden via-golden-light to-golden relative overflow-hidden">
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
        </div>

        {/* Profile Information Card */}
        <div className="bg-white mx-6 -mt-20 rounded-xl shadow-lg p-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Profile Picture Section */}
            <div className="relative flex-shrink-0">
              <img 
                src={profile.profilePicture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"} 
                alt="Profile picture" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <button 
                onClick={() => setShowProfileModal(true)}
                className="absolute -bottom-2 -right-2 bg-secondary-blue text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <i className="fas fa-camera text-xs"></i>
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h2>
                  <p className="text-lg text-gray-600">{profile.title}</p>
                  <p className="text-gray-500 flex items-center mt-1">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    <span>{profile.location}</span>
                  </p>
                </div>
                
                {/* Applied Jobs Counter */}
                <div className="text-center lg:text-right mt-4 lg:mt-0">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Applied Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{profile.appliedJobsCount}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
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
              <div className="text-sm text-gray-600 mb-4">
                <p>{profile.education}</p>
                <p>Portfolio - <a href={profile.portfolio || '#'} className="text-secondary-blue hover:underline">{profile.portfolio}</a></p>
              </div>

              {/* Social Media & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
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
                <Button
                  onClick={() => setShowEditModal(true)}
                  className="bg-secondary-blue text-white hover:bg-blue-600"
                  size="sm"
                >
                  Edit Profile
                </Button>
              </div>
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
    </>
  );
}
