import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CameraIcon, Edit3Icon } from "lucide-react";

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
    department: profile.department,
    reportingTo: profile.reportingTo
  });

  const handleSaveProfile = () => {
    console.log('Saving profile:', editData);
    // Here you would typically call an API to update the profile
    setShowEditModal(false);
  };

  const handleFileUpload = (type: 'banner' | 'profile') => {
    console.log(`Upload ${type} clicked`);
    // Handle file upload logic
  };

  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="relative">
      {/* Banner Section */}
      <div className="relative h-32 bg-gradient-to-r from-orange-400 to-orange-600 rounded-t-lg overflow-hidden">
        {profile.bannerImage && (
          <img 
            src={profile.bannerImage} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        )}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white"
          onClick={() => handleFileUpload('banner')}
        >
          <CameraIcon className="h-4 w-4 mr-1" />
          Change Banner
        </Button>
      </div>

      {/* Profile Info Section */}
      <div className="relative px-6 pb-6 bg-white dark:bg-gray-800 rounded-b-lg border-x border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-4">
          {/* Profile Picture */}
          <div className="relative -mt-12 mb-4 sm:mb-0">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg">
                <AvatarImage src={profile.profilePicture || undefined} alt={profile.name} />
                <AvatarFallback className="bg-orange-500 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="secondary"
                size="sm"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                onClick={() => handleFileUpload('profile')}
              >
                <CameraIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Name and Role */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {profile.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile.role} • {profile.department}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Employee ID: {profile.employeeId}
                </p>
              </div>
              
              <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit3Icon className="h-4 w-4 mr-1" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={editData.department}
                        onChange={(e) => setEditData({...editData, department: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reportingTo">Reporting To</Label>
                      <Input
                        id="reportingTo"
                        value={editData.reportingTo}
                        onChange={(e) => setEditData({...editData, reportingTo: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowEditModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} className="bg-orange-600 hover:bg-orange-700 text-white">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Phone:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{profile.phone}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Email:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{profile.email}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Joining Date:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{profile.joiningDate}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Reporting To:</span>
            <span className="ml-2 text-gray-900 dark:text-white">{profile.reportingTo}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-gray-500 dark:text-gray-400">Total Contribution:</span>
            <span className="ml-2 text-gray-900 dark:text-white font-semibold">₹{profile.totalContribution}</span>
          </div>
        </div>
      </div>
    </div>
  );
}