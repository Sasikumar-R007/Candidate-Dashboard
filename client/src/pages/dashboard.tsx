import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import Sidebar from '@/components/dashboard/sidebar';
import ProfileMenu from '@/components/dashboard/profile-menu';
import TabNavigation from '@/components/dashboard/tab-navigation';
import ResumeTab from '@/components/dashboard/tabs/resume-tab';
import JobPreferencesTab from '@/components/dashboard/tabs/job-preferences-tab';
import ActivityTab from '@/components/dashboard/tabs/activity-tab';
import JobBoardTab from '@/components/dashboard/tabs/job-board-tab';
import MyJobsTab from '@/components/dashboard/tabs/my-jobs-tab';
import EditViewProfile from '@/pages/edit-view-profile';
import { useProfile } from '@/hooks/use-profile';
import { MessageCircle, HelpCircle, Bell, Briefcase } from 'lucide-react';
import { useCandidateAuth } from '@/contexts/auth-context';
import { ChatDock } from '@/components/chat/chat-dock';

export default function Dashboard() {
  const [sidebarTab, setSidebarTab] = useState('my-jobs');
  const [activeTab, setActiveTab] = useState('my-jobs');
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = useProfile();
  const candidate = useCandidateAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
          <div className="flex flex-col flex-1 h-full">
            {/* Header with ProfileMenu */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 relative z-30 sticky top-0">
              <div className="flex items-center pl-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setChatOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  data-testid="button-help"
                >
                  <HelpCircle size={16} />
                  <span className="text-sm">Help</span>
                </button>
                <ProfileMenu
                  userName={candidate?.fullName || "Candidate"}
                  userRole="Candidate"
                  logoutEndpoint="/api/auth/candidate-logout"
                  profilePicture={(candidate as any)?.profilePicture}
                  showChatInDropdown={false}
                  onChatClick={() => setChatOpen(true)}
                />
              </div>
            </header>
            {/* Main content area */}
            <div className="flex-1 overflow-y-auto">
              <MyJobsTab onNavigateToJobBoard={() => setSidebarTab('job-board')} />
            </div>
          </div>
        );
      case 'job-preferences':
        return (
          <div className="flex flex-col flex-1 h-full">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 relative z-30 sticky top-0">
              <div className="flex items-center pl-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Job Preferences
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setChatOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  data-testid="button-help"
                >
                  <HelpCircle size={16} />
                  <span className="text-sm">Help</span>
                </button>
                <ProfileMenu
                  userName={candidate?.fullName || "Candidate"}
                  userRole="Candidate"
                  logoutEndpoint="/api/auth/candidate-logout"
                  profilePicture={(candidate as any)?.profilePicture}
                  showChatInDropdown={false}
                  onChatClick={() => setChatOpen(true)}
                />
              </div>
            </header>
            <div className="flex-1 overflow-y-auto">
              <JobPreferencesTab />
            </div>
          </div>
        );
      case 'edit-view':
        return (
          <div className="flex flex-col flex-1 h-full">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 relative z-30 sticky top-0">
              <div className="flex items-center pl-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Edit Profile
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setChatOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  data-testid="button-help"
                >
                  <HelpCircle size={16} />
                  <span className="text-sm">Help</span>
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    onBlur={() => setTimeout(() => setShowNotifications(false), 150)}
                    className="relative flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    data-testid="button-notifications"
                  >
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-4 z-50">
                      <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <Bell size={18} />
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                              <MessageCircle size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New Messages</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">You have 3 unread messages from recruiters</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 hours ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                              <Briefcase size={16} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Job Application Update</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Your application for Senior Developer at TechCorp is under review</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">5 hours ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <ProfileMenu
                  userName={candidate?.fullName || "Candidate"}
                  userRole="Candidate"
                  logoutEndpoint="/api/auth/candidate-logout"
                  profilePicture={(candidate as any)?.profilePicture}
                  showChatInDropdown={false}
                  onChatClick={() => setChatOpen(true)}
                />
              </div>
            </header>
            <div className="flex-1 overflow-y-auto">
              <EditViewProfile profile={profile!} />
            </div>
          </div>
        );
      case 'job-board':
        return (
          <div className="flex flex-col flex-1 h-full">
            <div className="flex-1 overflow-y-auto">
              <JobBoardTab 
                onNavigateToJobPreferences={() => setSidebarTab('job-preferences')}
                onNavigateToProfile={() => setSidebarTab('edit-view')}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col flex-1 h-full">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 relative z-30 sticky top-0">
              <div className="flex items-center pl-4">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setChatOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  data-testid="button-help"
                >
                  <HelpCircle size={16} />
                  <span className="text-sm">Help</span>
                </button>
                <ProfileMenu
                  userName={candidate?.fullName || "Candidate"}
                  userRole="Candidate"
                  logoutEndpoint="/api/auth/candidate-logout"
                  profilePicture={(candidate as any)?.profilePicture}
                  showChatInDropdown={false}
                  onChatClick={() => setChatOpen(true)}
                />
              </div>
            </header>
            <div className="flex-1 overflow-y-auto">
              <MyJobsTab onNavigateToJobBoard={() => setSidebarTab('job-board')} />
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
        
        {/* Floating Chat Button */}
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-40"
          data-testid="button-floating-chat"
          aria-label="Open Chat"
        >
          <MessageCircle size={24} />
        </button>
      </div>

      {/* Chat Dock Component */}
      <ChatDock 
        open={chatOpen} 
        onClose={() => setChatOpen(false)}
        userName="Support Team"
      />
    </div>
  );
}
