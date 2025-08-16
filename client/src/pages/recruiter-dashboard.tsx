import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import TeamLeaderProfileHeader from '@/components/dashboard/team-leader-profile-header';
import RecruiterTabNavigation from '@/components/dashboard/recruiter-tab-navigation';
import { useQuery } from "@tanstack/react-query";

export default function RecruiterDashboard() {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('updates');

  // Mock recruiter profile data based on the image provided
  const recruiterProfile = {
    id: "rec-001",
    name: "Kumaravel R",
    role: "Talent Advisor",
    employeeId: "STTA005",
    phone: "9998887770",
    email: "kumaravel@scaling.com",
    joiningDate: "5/11/2023",
    department: "Talent Advisory",
    reportingTo: "Prakash Raj Raja",
    totalContribution: "0",
    bannerImage: null,
    profilePicture: null
  };

  const renderDashboardTabContent = () => {
    switch (activeTab) {
      case 'updates':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Updates</h2>
            <div className="text-gray-600 dark:text-gray-400">
              Updates content will be implemented here
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
            <TeamLeaderProfileHeader profile={recruiterProfile} />
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
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderSidebarContent()}
      </div>
    </div>
  );
}