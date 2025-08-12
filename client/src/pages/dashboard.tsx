import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import ProfileHeader from '@/components/dashboard/profile-header';
import TabNavigation from '@/components/dashboard/tab-navigation';
import MyProfileTab from '@/components/dashboard/tabs/my-profile-tab';
import ResumeTab from '@/components/dashboard/tabs/resume-tab';
import JobPreferencesTab from '@/components/dashboard/tabs/job-preferences-tab';
import ActivityTab from '@/components/dashboard/tabs/activity-tab';
import JobBoardTab from '@/components/dashboard/tabs/job-board-tab';
import MyJobsTab from '@/components/dashboard/tabs/my-jobs-tab';
import { useProfile } from '@/hooks/use-profile';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('my-jobs');
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
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
        return <MyJobsTab />;
      case 'my-profile':
        return <MyProfileTab profile={profile} />;
      case 'resume':
        return <ResumeTab />;
      case 'job-preferences':
        return <JobPreferencesTab />;
      case 'activity':
        return <ActivityTab />;
      case 'job-board':
        return <JobBoardTab />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
              <p className="text-gray-600">Manage your account preferences and privacy settings</p>
            </div>
          </div>
        );
      case 'sign-out':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign Out</h2>
              <p className="text-gray-600">You have been signed out successfully</p>
            </div>
          </div>
        );
      default:
        return <MyProfileTab profile={profile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
      <div className="flex min-h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex flex-col overflow-hidden ml-64">
          {/* Show profile header and tabs only for profile-related sections */}
          {['my-profile', 'resume', 'job-preferences', 'activity', 'my-jobs'].includes(activeTab) ? (
            <>
              <ProfileHeader profile={profile} />
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            </>
          ) : null}
          
          <div className="flex-1 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
