import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import RecruiterProfileHeader from '@/components/dashboard/recruiter-profile-header';
import RecruiterTabNavigation from '@/components/dashboard/recruiter-tab-navigation';
import { useQuery } from "@tanstack/react-query";

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

export default function RecruiterDashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('updates');

  // Use API data for recruiter profile
  const { data: recruiterProfile } = useQuery<RecruiterProfile>({
    queryKey: ['/api/recruiter/profile'],
  });

  if (!recruiterProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  const renderDashboardTabContent = () => {
    switch (activeTab) {
      case 'updates':
        return (
          <div className="p-6">
            {/* Header with action buttons */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Updates</h2>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Post Jobs
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Upload Resume
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Source Resume
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Active Jobs Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <i className="fas fa-briefcase text-xl text-gray-600 dark:text-gray-400"></i>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active jobs</h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">12</div>
                  <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-3 py-1 rounded-full">
                    Total Jobs Posted: 25
                  </div>
                </div>
              </div>

              {/* New Applications Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user text-xl text-gray-600 dark:text-gray-400"></i>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New applications:</h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-3">12</div>
                  <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-3 py-1 rounded-full">
                    Candidates Applied: 82
                  </div>
                </div>
              </div>

              {/* Interview Tracker Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Interview Tracker</h3>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Today's Schedule</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">0</div>
                    <button className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors">
                      Add
                    </button>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending cases</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">9</div>
                    <button className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'requirements':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Requirements</h2>
            <div className="text-gray-600 dark:text-gray-400">
              Requirements content will be implemented here
            </div>
          </div>
        );
      case 'pipeline':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Pipeline</h2>
            <div className="text-gray-600 dark:text-gray-400">
              Pipeline content will be implemented here
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Performance</h2>
            <div className="text-gray-600 dark:text-gray-400">
              Performance content will be implemented here
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h2>
          </div>
        );
    }
  };

  const renderSidebarContent = () => {
    switch (sidebarTab) {
      case 'dashboard':
        return (
          <>
            <RecruiterProfileHeader profile={recruiterProfile} />
            <RecruiterTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 overflow-y-auto">
              {renderDashboardTabContent()}
            </div>
          </>
        );
      case 'job-board':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Job Board</h2>
              <p className="text-gray-600 dark:text-gray-400">Recruiter job board functionality will be implemented here</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your recruiter preferences and settings</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar 
        activeTab={sidebarTab} 
        onTabChange={setSidebarTab}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {renderSidebarContent()}
      </div>
    </div>
  );
}