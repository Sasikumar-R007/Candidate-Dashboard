import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/dashboard/sidebar';
import ProfileMenu from '@/components/dashboard/profile-menu';
import TabNavigation from '@/components/dashboard/tab-navigation';
import ResumeTab from '@/components/dashboard/tabs/resume-tab';
import SettingsTab from '@/components/dashboard/tabs/settings-tab';
import ActivityTab from '@/components/dashboard/tabs/activity-tab';
import JobBoardTab from '@/components/dashboard/tabs/job-board-tab';
import MyJobsTab from '@/components/dashboard/tabs/my-jobs-tab';
import EditViewProfile from '@/pages/edit-view-profile';
import { useProfile } from '@/hooks/use-profile';
import { useJobApplications } from '@/hooks/use-job-applications';
import { MessageCircle, HelpCircle } from 'lucide-react';
import { ChatDock } from '@/components/chat/chat-dock';

import DashboardHeader from '@/components/dashboard/dashboard-header';
import CandidatePlatformWelcomeModal from '@/components/candidate-dashboard/candidate-platform-welcome-modal';
import RecruiterTaggedJobConsentModal from '@/components/candidate-dashboard/recruiter-tagged-job-consent-modal';
import { CandidateNotificationBell } from '@/components/dashboard/candidate-notification-bell';
import { logConsent } from '@/lib/consent-log';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CANDIDATE_HELP_FAB_SESSION_KEY } from '@/lib/candidate-ui-preferences';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sidebarTab, setSidebarTab] = useState('my-jobs');
  const [activeTab, setActiveTab] = useState('my-jobs');
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = useProfile();
  const { data: jobApplications = [], isLoading: jobsLoading } = useJobApplications({
    enabled: !!profile,
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [helpFabVisible, setHelpFabVisible] = useState(
    () => sessionStorage.getItem(CANDIDATE_HELP_FAB_SESSION_KEY) !== '1',
  );

  const dismissHelpFab = () => {
    sessionStorage.setItem(CANDIDATE_HELP_FAB_SESSION_KEY, '1');
    setHelpFabVisible(false);
  };

  const headerActions = (
    <div className="flex items-center gap-3">
      <CandidateNotificationBell onNavigateToMyJobs={() => setSidebarTab('my-jobs')} />
      <ProfileMenu
        name={profile?.firstName ? `${profile.firstName} ${profile.lastName}` : ''}
        candidateId={profile?.candidateId || ''}
        profilePicture={profile?.profilePicture}
        onNavigateToSettings={() => setSidebarTab('settings')}
        onOpenSupport={() => setChatOpen(true)}
      />
    </div>
  );

  const pendingTaggedApplications = useMemo(
    () =>
      (jobApplications || []).filter((app) => {
        const src = String(app.source || '').toLowerCase();
        return src === 'recruiter_tagged' && (app as { isCandidateConfirmed?: boolean }).isCandidateConfirmed === false;
      }),
    [jobApplications],
  );

  const activeTaggedApplication = pendingTaggedApplications[0] ?? null;
  const platformConsentAccepted = profile?.platformConsentAccepted === true;

  const showTaggedConsentModal =
    !!profile &&
    !jobsLoading &&
    !!activeTaggedApplication;
  const showPlatformConsentModal =
    !!profile &&
    !jobsLoading &&
    !platformConsentAccepted &&
    !showTaggedConsentModal;

  const handleConsentAccept = async () => {
    if (!profile?.id) return;
    const ok = await logConsent({
      user_id: profile.id,
      role: "candidate",
      consent_type: "platform_consent",
      policy_version: "2026-05-10",
    });
    if (ok) {
      await queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    } else {
      toast({
        title: "Could not save agreement",
        description: "Check your connection and try again. Your agreement was not recorded.",
        variant: "destructive",
      });
    }
  };

  const handleTaggedConsentConfirmed = () => {
    void queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
  };

  useEffect(() => {
    if (showTaggedConsentModal || showPlatformConsentModal) setChatOpen(false);
  }, [showTaggedConsentModal, showPlatformConsentModal]);

  // Navigation Guard: Redirect to onboarding if not completed
  useEffect(() => {
    // DISABLE REDIRECT FOR TESTING - Let's see if we can stay on the page
    console.log("[GUARD] Current Status:", profile?.registrationStage);
    
    if (profile && profile.registrationStage && profile.registrationStage !== 'completed') {
      console.log("[GUARD] Would have redirected, but holding for sync...");
    }
  }, [profile?.registrationStage]);

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

  if (jobsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600 mb-3"></div>
          <div className="text-lg text-gray-600">Loading your applications…</div>
        </div>
      </div>
    );
  }

  const renderSidebarContent = () => {
    switch (sidebarTab) {
      case 'my-jobs':
        return (
          <div className="flex flex-col flex-1 min-h-0 h-full overflow-hidden">
            <DashboardHeader 
              title="My Jobs" 
              actions={headerActions}
            />
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
              <MyJobsTab 
                onNavigateToJobBoard={() => setSidebarTab('job-board')} 
                onNavigateToProfile={() => setSidebarTab('edit-view')}
                onNavigateToSettings={() => setSidebarTab('settings')}
                onOpenSupport={() => setChatOpen(true)}
              />
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex flex-col flex-1 h-full">
            <DashboardHeader 
              title="Settings" 
              actions={headerActions}
            />
            <div className="flex-1 overflow-y-auto mt-4 px-8 pb-8">
              <SettingsTab onOpenSupport={() => setChatOpen(true)} />
            </div>
          </div>
        );
      case 'edit-view':
        return (
          <div className="flex flex-col flex-1 h-full font-poppins">
            <DashboardHeader 
              title="Profile" 
              actions={headerActions}
            />
            <div className="flex-1 overflow-y-auto">
              <EditViewProfile profile={profile!} onNavigateToJobBoard={() => setSidebarTab('job-board')} />
            </div>
          </div>
        );
      case 'job-board':
        return (
          <div className="flex flex-col flex-1 h-full">
            <DashboardHeader 
              title="Job Board" 
              actions={headerActions}
            />
            <div className="flex-1 overflow-y-auto">
              <JobBoardTab 
                onNavigateToSettings={() => setSidebarTab('settings')}
                onNavigateToProfile={() => setSidebarTab('edit-view')}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col flex-1 h-full">
            <DashboardHeader title="Candidate Workspace" />
            <div className="flex-1 overflow-y-auto">
              <MyJobsTab 
                onNavigateToJobBoard={() => setSidebarTab('job-board')} 
                onNavigateToProfile={() => setSidebarTab('edit-view')}
              />
            </div>
          </div>
        );
    }
  };


  const renderDashboardTabContent = () => {
    switch (activeTab) {
      case 'my-jobs':
        return (
          <MyJobsTab 
            onNavigateToJobBoard={() => setSidebarTab('job-board')} 
            onNavigateToProfile={() => setSidebarTab('edit-view')}
          />
        );
      case 'settings':
        return <SettingsTab />;
      default:
        return (
          <MyJobsTab 
            onNavigateToJobBoard={() => setSidebarTab('job-board')} 
            onNavigateToProfile={() => setSidebarTab('edit-view')}
          />
        );
    }
  };

  const anyConsentBlocking = showTaggedConsentModal || showPlatformConsentModal;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
      <RecruiterTaggedJobConsentModal
        open={showTaggedConsentModal}
        candidateProfileId={profile?.id}
        application={
          activeTaggedApplication
            ? {
                id: activeTaggedApplication.id,
                jobTitle: activeTaggedApplication.jobTitle,
                company: activeTaggedApplication.company,
              }
            : null
        }
        onConfirmed={handleTaggedConsentConfirmed}
      />
      <CandidatePlatformWelcomeModal open={showPlatformConsentModal} onAccept={handleConsentAccept} />

      <div
        className={`flex h-screen overflow-hidden ${anyConsentBlocking ? "pointer-events-none select-none" : ""}`}
        aria-hidden={anyConsentBlocking}
      >
        <Sidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden ml-16 bg-gray-50">
          {renderSidebarContent()}
        </div>
        
        {/* Floating Chat Button */}
        <AnimatePresence>
          {helpFabVisible && !anyConsentBlocking && (
            <motion.div
              key="candidate-help-fab"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed bottom-6 right-6 z-40"
            >
              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-purple-700"
                data-testid="button-floating-chat"
                aria-label="Open Chat"
              >
                <MessageCircle size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissHelpFab();
                }}
                className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition hover:bg-gray-50 hover:text-gray-800"
                aria-label="Close help button"
                data-testid="button-dismiss-help-fab"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Dock Component */}
      <ChatDock 
        open={chatOpen && !anyConsentBlocking} 
        onClose={() => setChatOpen(false)}
        userName="Support Team"
      />
    </div>
  );
}
