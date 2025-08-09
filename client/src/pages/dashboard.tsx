import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import ProfileHeader from '@/components/dashboard/profile-header';
import TabNavigation from '@/components/dashboard/tab-navigation';
import MyProfileTab from '@/components/dashboard/tabs/my-profile-tab';
import ResumeTab from '@/components/dashboard/tabs/resume-tab';
import JobPreferencesTab from '@/components/dashboard/tabs/job-preferences-tab';
import ActivityTab from '@/components/dashboard/tabs/activity-tab';
import { useProfile } from '@/hooks/use-profile';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('my-profile');
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-500">Profile not found</div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'my-jobs':
        return <div className="p-6">My Jobs content coming soon...</div>;
      case 'my-profile':
        return <MyProfileTab profile={profile} />;
      case 'resume':
        return <ResumeTab />;
      case 'job-preferences':
        return <JobPreferencesTab />;
      case 'activity':
        return <ActivityTab />;
      default:
        return <MyProfileTab profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <ProfileHeader profile={profile} />
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
