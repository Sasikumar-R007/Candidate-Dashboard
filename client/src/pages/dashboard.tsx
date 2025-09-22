import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import SimpleClientHeader from '@/components/dashboard/simple-client-header';
import TabNavigation from '@/components/dashboard/tab-navigation';
import MyProfileTab from '@/components/dashboard/tabs/my-profile-tab';
import ResumeTab from '@/components/dashboard/tabs/resume-tab';
import JobPreferencesTab from '@/components/dashboard/tabs/job-preferences-tab';
import ActivityTab from '@/components/dashboard/tabs/activity-tab';
import JobBoardTab from '@/components/dashboard/tabs/job-board-tab';
import MyJobsTab from '@/components/dashboard/tabs/my-jobs-tab';
import CandidateMetricsSidebar from '@/components/dashboard/candidate-metrics-sidebar';
import ProfilePage from '@/pages/profile';
import { useProfile } from '@/hooks/use-profile';

export default function Dashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
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

  const renderSidebarContent = () => {
    switch (sidebarTab) {
      case 'dashboard':
        // Render dashboard with tab navigation and metrics sidebar
        return (
          <div className="flex flex-1">
            <div className="flex-1 flex flex-col">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="flex-1 overflow-y-auto">
                {renderDashboardTabContent()}
              </div>
            </div>
            {activeTab === 'my-jobs' && <CandidateMetricsSidebar />}
          </div>
        );
      case 'profile':
        return <ProfilePage profile={profile!} />;
      case 'job-board':
        return <JobBoardTab />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
              <p className="text-gray-600">Access your settings and preferences</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-1">
            <div className="flex-1 flex flex-col">
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="flex-1 overflow-y-auto">
                {renderDashboardTabContent()}
              </div>
            </div>
            {activeTab === 'my-jobs' && <CandidateMetricsSidebar />}
          </div>
        );
    }
  };

  const renderDashboardTabContent = () => {
    switch (activeTab) {
      case 'my-jobs':
        return <MyJobsTab onNavigateToJobBoard={() => setSidebarTab('job-board')} />;
      case 'my-profile':
        return <MyProfileTab profile={profile} />;
      case 'resume':
        return <ResumeTab />;
      case 'job-preferences':
        return <JobPreferencesTab />;
      case 'activity':
        return <ActivityTab />;
      default:
        return <MyJobsTab onNavigateToJobBoard={() => setSidebarTab('job-board')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
      <div className="flex min-h-screen">
        <Sidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
        <div className="flex-1 flex flex-col overflow-hidden ml-16">
          {renderSidebarContent()}
        </div>
      </div>
    </div>
  );
}
