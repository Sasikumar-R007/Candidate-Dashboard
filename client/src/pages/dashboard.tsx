import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import SimpleClientHeader from '@/components/dashboard/simple-client-header';
import TabNavigation from '@/components/dashboard/tab-navigation';
import ResumeTab from '@/components/dashboard/tabs/resume-tab';
import JobPreferencesTab from '@/components/dashboard/tabs/job-preferences-tab';
import ActivityTab from '@/components/dashboard/tabs/activity-tab';
import JobBoardTab from '@/components/dashboard/tabs/job-board-tab';
import MyJobsTab from '@/components/dashboard/tabs/my-jobs-tab';
import CandidateMetricsSidebar from '@/components/dashboard/candidate-metrics-sidebar';
import ProfilePage from '@/pages/profile';
import { useProfile } from '@/hooks/use-profile';

export default function Dashboard() {
  const [sidebarTab, setSidebarTab] = useState('my-jobs');
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
      case 'my-jobs':
        return (
          <div className="flex flex-1 h-full">
            {/* Main content area - independently scrollable */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto">
                <MyJobsTab onNavigateToJobBoard={() => setSidebarTab('job-board')} />
              </div>
            </div>
            {/* Metrics sidebar - independently scrollable */}
            <div className="w-80 flex-shrink-0">
              <CandidateMetricsSidebar />
            </div>
          </div>
        );
      case 'job-preferences':
        return (
          <div className="flex flex-1 h-full">
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto">
                <JobPreferencesTab />
              </div>
            </div>
          </div>
        );
      case 'profile':
        return <ProfilePage profile={profile!} />;
      case 'job-board':
        return <JobBoardTab />;
      default:
        // Default to My Jobs
        return (
          <div className="flex flex-1 h-full">
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto">
                <MyJobsTab onNavigateToJobBoard={() => setSidebarTab('job-board')} />
              </div>
            </div>
            <div className="w-80 flex-shrink-0">
              <CandidateMetricsSidebar />
            </div>
          </div>
        );
    }
  };

  const renderDashboardTabContent = () => {
    switch (activeTab) {
      case 'my-jobs':
        return <MyJobsTab onNavigateToJobBoard={() => setSidebarTab('job-board')} />;
      case 'job-preferences':
        return <JobPreferencesTab />;
      default:
        return <MyJobsTab onNavigateToJobBoard={() => setSidebarTab('job-board')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
      <div className="flex h-screen overflow-hidden">
        <Sidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
        <div className="flex-1 flex flex-col overflow-hidden ml-16">
          {renderSidebarContent()}
        </div>
      </div>
    </div>
  );
}
