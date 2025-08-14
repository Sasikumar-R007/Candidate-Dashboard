import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/hooks/use-toast';
import FileUploadModal from './modals/file-upload-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldIcon } from "lucide-react";

interface AdminProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  bannerImage?: string | null;
  profilePicture?: string | null;
}

interface AdminProfileHeaderProps {
  profile: AdminProfile;
  onProfileUpdate?: (profile: AdminProfile) => void;
}

export default function AdminProfileHeader({ profile, onProfileUpdate }: AdminProfileHeaderProps) {
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(profile);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();
  const { toast } = useToast();

  // Sync with parent profile changes
  useEffect(() => {
    setCurrentProfile(profile);
  }, [profile]);

  const handleBannerUpload = async (file: File) => {
    setIsUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/upload/banner', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      // Update profile with new banner image
      const profileResponse = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bannerImage: result.url }),
      });
      
      if (profileResponse.ok) {
        const updatedProfile = await profileResponse.json();
        setCurrentProfile(updatedProfile);
        onProfileUpdate?.(updatedProfile);
        toast({
          title: "Success",
          description: "Banner uploaded successfully",
        });
      }
      
      setShowBannerModal(false);
    } catch (error) {
      console.error('Banner upload failed:', error);
      toast({
        title: "Error",
        description: "Failed to upload banner",
        variant: "destructive",
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleProfileUpload = async (file: File) => {
    setIsUploadingProfile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/upload/profile', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      
      // Update profile with new profile picture
      const profileResponse = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePicture: result.url }),
      });
      
      if (profileResponse.ok) {
        const updatedProfile = await profileResponse.json();
        setCurrentProfile(updatedProfile);
        onProfileUpdate?.(updatedProfile);
        toast({
          title: "Success",
          description: "Profile picture uploaded successfully",
        });
      }
      
      setShowProfileModal(false);
    } catch (error) {
      console.error('Profile upload failed:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleDeleteBanner = async () => {
    try {
      // Update profile to remove banner image
      const profileResponse = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bannerImage: null }),
      });
      
      if (profileResponse.ok) {
        const updatedProfile = await profileResponse.json();
        setCurrentProfile(updatedProfile);
        onProfileUpdate?.(updatedProfile);
        toast({
          title: "Success",
          description: "Banner removed successfully",
        });
      }
    } catch (error) {
      console.error('Banner deletion failed:', error);
      toast({
        title: "Error",
        description: "Failed to remove banner",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      {/* Banner Background */}
      <div className="h-56 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 relative">
        {currentProfile.bannerImage && (
          <img 
            src={currentProfile.bannerImage} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        )}

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
            onClick={() => setShowBannerModal(true)}
            className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            size="sm"
          >
            <i className="fas fa-camera mr-2"></i>Change Banner
          </Button>
          {currentProfile.bannerImage && (
            <Button
              onClick={handleDeleteBanner}
              className="bg-red-500/80 backdrop-blur-sm text-white hover:bg-red-600/80"
              size="sm"
            >
              <i className="fas fa-trash mr-2"></i>Delete
            </Button>
          )}
        </div>

        {/* Profile Picture */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16 z-30">
          <div className="relative">
            <img 
              src={
                currentProfile.profilePicture ||
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150"
              }
              alt="Profile picture" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <button 
              onClick={() => setShowProfileModal(true)}
              className="absolute -bottom-1 -right-1 bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
            >
              <i className="fas fa-camera text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white dark:bg-gray-800 mx-6 pt-6 pb-8 px-6 shadow-lg rounded-b-xl relative z-10 mt-0">
        <div className="flex items-start justify-between mb-6">
          {/* Left side - Empty for admin */}
          <div></div>

          {/* Right side - Theme Toggle and Edit Button */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-2"
              title="Toggle theme"
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
            </button>

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <i className="fas fa-edit mr-2"></i>
                  Edit profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Admin Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" defaultValue={currentProfile.name} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role</Label>
                    <Input id="role" defaultValue={currentProfile.role} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" defaultValue={currentProfile.email} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone</Label>
                    <Input id="phone" defaultValue={currentProfile.phone} className="col-span-3" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setShowEditModal(false)}>Save Changes</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Profile Info - Centered */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {currentProfile.name}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <p className="text-lg text-purple-600 dark:text-purple-400 font-semibold">
              {currentProfile.role}
            </p>
          </div>

          {/* Contact Information */}
          <div className="flex items-center justify-center gap-6 text-gray-600 dark:text-gray-400">
            <span className="flex items-center">
              <i className="fas fa-phone mr-2"></i>
              <span>{currentProfile.phone}</span>
            </span>
            <span className="flex items-center">
              <i className="fas fa-envelope mr-2"></i>
              <span>{currentProfile.email}</span>
            </span>
          </div>
        </div>
      </div>

      {/* File Upload Modals */}
      <FileUploadModal
        open={showBannerModal}
        onOpenChange={setShowBannerModal}
        onUpload={handleBannerUpload}
        title="Change Banner Image"
        accept="image/*"
        isUploading={isUploadingBanner}
      />

      <FileUploadModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        onUpload={handleProfileUpload}
        title="Change Profile Picture"
        accept="image/*"
        isUploading={isUploadingProfile}
      />
    </div>
  );
}