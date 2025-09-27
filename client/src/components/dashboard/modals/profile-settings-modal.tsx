import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, User, Contact, Briefcase, Award, Shield, X, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth, useEmployeeAuth, useCandidateAuth } from "@/contexts/auth-context";
import type { Employee, Candidate } from '@shared/schema';

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettingsModal({ open, onOpenChange }: ProfileSettingsModalProps) {
  const { user, setUser } = useAuth();
  const employee = useEmployeeAuth();
  const candidate = useCandidateAuth();
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Form data states
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    phone: '',
    
    // Employee specific
    role: '',
    department: '',
    employeeId: '',
    joiningDate: '',
    reportingTo: '',
    
    // Candidate specific
    company: '',
    designation: '',
    location: '',
    experience: '',
    skills: '',
  });

  // Sync form data with auth context when user data loads
  useEffect(() => {
    const updatedFormData = {
      // Common fields
      name: employee?.name || candidate?.fullName || '',
      email: employee?.email || candidate?.email || '',
      phone: employee?.phone || candidate?.phone || '',
      
      // Employee specific
      role: employee?.role || '',
      department: employee?.department || '',
      employeeId: employee?.employeeId || '',
      joiningDate: employee?.joiningDate || '',
      reportingTo: employee?.reportingTo || '',
      
      // Candidate specific
      company: candidate?.company || '',
      designation: candidate?.designation || '',
      location: candidate?.location || '',
      experience: candidate?.experience || '',
      skills: candidate?.skills || '',
    };
    
    setFormData(updatedFormData);
  }, [employee, candidate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSave = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const endpoint = user?.type === 'employee' 
        ? '/api/employee/change-password' 
        : '/api/candidate/change-password';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });

      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleFileSelect = (type: 'banner' | 'profile', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      if (type === 'banner') {
        setBannerFile(file);
        setBannerPreview(preview);
      } else {
        setProfileFile(file);
        setProfilePreview(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (file: File, type: 'banner' | 'profile') => {
    try {
      const formData = new FormData();
      formData.append(type === 'banner' ? 'banner' : 'profile', file);
      
      const endpoint = user?.type === 'employee' 
        ? `/api/upload/${type}` 
        : `/api/upload/${type}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error(`Failed to upload ${type}`);
      
      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error(`${type} upload error:`, error);
      throw error;
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    try {
      let bannerUrl = null;
      let profileUrl = null;

      // Upload files if selected
      if (bannerFile) {
        bannerUrl = await handleImageUpload(bannerFile, 'banner');
      }
      if (profileFile) {
        profileUrl = await handleImageUpload(profileFile, 'profile');
      }

      // Prepare profile update data
      const updateData: any = {
        ...formData,
      };

      if (bannerUrl) updateData.bannerImage = bannerUrl;
      if (profileUrl) updateData.profilePicture = profileUrl;

      // API endpoint based on user type
      const apiEndpoint = user?.type === 'employee' 
        ? '/api/employee/profile' 
        : '/api/candidate/profile';

      const response = await fetch(apiEndpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      
      // Update auth context with new data
      if (user) {
        setUser({
          ...user,
          data: updatedProfile
        });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearImagePreview = (type: 'banner' | 'profile') => {
    if (type === 'banner') {
      setBannerFile(null);
      setBannerPreview(null);
    } else {
      setProfileFile(null);
      setProfilePreview(null);
    }
  };

  const currentBannerImage = bannerPreview || (employee as any)?.bannerImage || (candidate as any)?.bannerImage;
  const currentProfileImage = profilePreview || (employee as any)?.profilePicture || (candidate as any)?.profilePicture;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Manage your profile information, photos, and account details.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Contact className="h-4 w-4" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photos
              </TabsTrigger>
              <TabsTrigger value="work" className="flex items-center gap-2">
                {user?.type === 'employee' ? <Briefcase className="h-4 w-4" /> : <Award className="h-4 w-4" />}
                {user?.type === 'employee' ? 'Work Details' : 'Experience'}
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        data-testid="input-profile-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        data-testid="input-profile-email"
                      />
                    </div>
                  </div>
                  {user?.type === 'employee' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Input
                          id="role"
                          value={formData.role}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                          placeholder="Enter your role"
                          data-testid="input-profile-role"
                        />
                      </div>
                      <div>
                        <Label htmlFor="employeeId">Employee ID</Label>
                        <Input
                          id="employeeId"
                          value={formData.employeeId}
                          onChange={(e) => handleInputChange('employeeId', e.target.value)}
                          placeholder="Employee ID"
                          data-testid="input-employee-id"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Contact className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        data-testid="input-profile-phone"
                      />
                    </div>
                    {user?.type === 'candidate' && (
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Enter your location"
                          data-testid="input-profile-location"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              <div className="space-y-6">
                {/* Banner Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Banner Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden relative">
                        {currentBannerImage && (
                          <>
                            <img 
                              src={currentBannerImage} 
                              alt="Banner" 
                              className="w-full h-full object-cover"
                            />
                            {bannerPreview && (
                              <button
                                onClick={() => clearImagePreview('banner')}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                data-testid="button-remove-banner-preview"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Label htmlFor="banner-upload" className="cursor-pointer">
                            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/30">
                              <Upload className="h-4 w-4" />
                              Change Banner
                            </div>
                          </Label>
                          <Input
                            id="banner-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect('banner', e.target.files[0])}
                            className="hidden"
                            data-testid="input-banner-upload"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Picture */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img 
                          src={currentProfileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150"} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                        />
                        {profilePreview && (
                          <button
                            onClick={() => clearImagePreview('profile')}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            data-testid="button-remove-profile-preview"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="profile-upload" className="cursor-pointer">
                          <Button variant="outline" type="button">
                            <Camera className="h-4 w-4 mr-2" />
                            Change Photo
                          </Button>
                        </Label>
                        <Input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleFileSelect('profile', e.target.files[0])}
                          className="hidden"
                          data-testid="input-profile-upload"
                        />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          Recommended: Square image, at least 200x200px
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="work" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {user?.type === 'employee' ? <Briefcase className="h-5 w-5" /> : <Award className="h-5 w-5" />}
                    {user?.type === 'employee' ? 'Work Details' : 'Professional Experience'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user?.type === 'employee' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          placeholder="Department"
                          data-testid="input-department"
                        />
                      </div>
                      <div>
                        <Label htmlFor="joiningDate">Joining Date</Label>
                        <Input
                          id="joiningDate"
                          type="date"
                          value={formData.joiningDate}
                          onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                          data-testid="input-joining-date"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="reportingTo">Reporting To</Label>
                        <Input
                          id="reportingTo"
                          value={formData.reportingTo}
                          onChange={(e) => handleInputChange('reportingTo', e.target.value)}
                          placeholder="Manager/Supervisor"
                          data-testid="input-reporting-to"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company">Current Company</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            placeholder="Company name"
                            data-testid="input-company"
                          />
                        </div>
                        <div>
                          <Label htmlFor="designation">Designation</Label>
                          <Input
                            id="designation"
                            value={formData.designation}
                            onChange={(e) => handleInputChange('designation', e.target.value)}
                            placeholder="Your current role"
                            data-testid="input-designation"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="experience">Experience</Label>
                        <Input
                          id="experience"
                          value={formData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          placeholder="Years of experience"
                          data-testid="input-experience"
                        />
                      </div>
                      <div>
                        <Label htmlFor="skills">Skills</Label>
                        <Textarea
                          id="skills"
                          value={formData.skills}
                          onChange={(e) => handleInputChange('skills', e.target.value)}
                          placeholder="List your key skills (comma separated)"
                          rows={3}
                          data-testid="textarea-skills"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Password & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          placeholder="Enter your current password"
                          data-testid="input-current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          data-testid="button-toggle-current-password"
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          placeholder="Enter your new password"
                          data-testid="input-new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          data-testid="button-toggle-new-password"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          placeholder="Confirm your new password"
                          data-testid="input-confirm-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          data-testid="button-toggle-confirm-password"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        onClick={handlePasswordSave} 
                        disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        data-testid="button-change-password"
                      >
                        {isChangingPassword ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Changing Password...
                          </>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            data-testid="button-cancel-profile-settings"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isUploading}
            data-testid="button-save-profile-settings"
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}