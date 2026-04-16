import { useState, useEffect } from "react";
import { ChevronDown, User, Settings, LogOut, HelpCircle, Bell, MessageCircle, Briefcase, Users, CheckCircle, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useEmployeeAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { ProfileSettingsModal } from "@/components/dashboard/modals/profile-settings-modal";
import type { UserActivity } from "@shared/schema";

interface AdminTopHeaderProps {
  companyName?: string;
  onHelpClick?: () => void;
  hideHelpButton?: boolean;
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'requirement_added':
      return { icon: Briefcase, bgClass: 'bg-blue-100 dark:bg-blue-900', textClass: 'text-blue-600 dark:text-blue-400' };
    case 'candidate_pipeline_changed':
      return { icon: Users, bgClass: 'bg-purple-100 dark:bg-purple-900', textClass: 'text-purple-600 dark:text-purple-400' };
    case 'closure_made':
      return { icon: CheckCircle, bgClass: 'bg-green-100 dark:bg-green-900', textClass: 'text-green-600 dark:text-green-400' };
    case 'candidate_submitted':
      return { icon: MessageCircle, bgClass: 'bg-orange-100 dark:bg-orange-900', textClass: 'text-orange-600 dark:text-orange-400' };
    case 'interview_scheduled':
      return { icon: Calendar, bgClass: 'bg-cyan-100 dark:bg-cyan-900', textClass: 'text-cyan-600 dark:text-cyan-400' };
    default:
      return { icon: Bell, bgClass: 'bg-gray-100 dark:bg-gray-800', textClass: 'text-gray-600 dark:text-gray-400' };
  }
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default function AdminTopHeader({ companyName = "Scaling Theory", onHelpClick, hideHelpButton = false }: AdminTopHeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profileModalView, setProfileModalView] = useState<"profile" | "settings">("profile");
  const [profileData, setProfileData] = useState<any>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();
  const employee = useEmployeeAuth();
  
  const userRole = employee?.role || 'admin';
  
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<UserActivity[]>({
    queryKey: ['/api/user-activities', userRole],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/user-activities/${userRole}?limit=5`, {});
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
    enabled: showUserDropdown, // Only fetch when dropdown is open
    refetchInterval: 30000,
  });
  
  useEffect(() => {
    const loadProfileData = async () => {
      if (!employee?.role) return;

      try {
        let endpoint = '';
        switch (employee.role) {
          case 'recruiter':
            endpoint = '/api/recruiter/profile';
            break;
          case 'team_leader':
            endpoint = '/api/team-leader/profile';
            break;
          case 'admin':
            endpoint = '/api/admin/profile';
            break;
          case 'client':
            endpoint = '/api/client/profile';
            break;
        }

        if (endpoint) {
          try {
            const response = await apiRequest('GET', endpoint);
            const data = await response.json();
            setProfileData(data);
          } catch (error) {
            // Silently fail - profile data is optional
          }
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    loadProfileData();

    const handleProfileUpdated = () => {
      loadProfileData();
    };

    window.addEventListener('profile-updated', handleProfileUpdated);
    return () => window.removeEventListener('profile-updated', handleProfileUpdated);
  }, [employee?.role]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserDropdown && !target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserDropdown]);
  
  const userName = profileData?.name || employee?.name || "Admin User";
  const userEmail = profileData?.email || employee?.email || "";
  const displayCompanyName = companyName;
  
  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'team_leader':
        return 'Team Leader';
      case 'recruiter':
        return 'Recruiter';
      case 'client':
        return 'Client';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
    }
  };
  
  const displayRole = getRoleDisplayName(userRole);
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/employee-logout', {});
      return await res.json();
    },
    onSuccess: () => {
      logout();
      // Clear any stored session data
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
      // Navigate to home page and prevent back navigation
      window.location.href = '/';
    },
    onError: (error: any) => {
      logout();
      // Clear any stored session data
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out",
        description: "You have been signed out (session cleared locally).",
      });
      // Navigate to home page and prevent back navigation
      window.location.href = '/';
    }
  });

  const handleLogout = () => {
    setShowUserDropdown(false);
    setShowSignOutDialog(true);
  };

  const confirmLogout = () => {
    logoutMutation.mutate();
    setShowSignOutDialog(false);
  };

  const handleProfileSettings = () => {
    setShowUserDropdown(false);
    setProfileModalView("profile");
    setShowProfileSettings(true);
  };

  const handleSystemSettings = () => {
    setShowUserDropdown(false);
    setProfileModalView("settings");
    setShowProfileSettings(true);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 relative z-30 sticky top-0">
      <div className="flex items-center min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate pl-2">
          {companyName}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {!hideHelpButton && (
          <button 
            onClick={onHelpClick}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            data-testid="button-header-help"
          >
            <HelpCircle size={16} />
            <span className="text-sm">Help</span>
          </button>
        )}

        <div className="relative user-dropdown-container">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            data-testid="button-user-dropdown"
          >
            {profileData?.profilePicture ? (
              <img
                src={profileData.profilePicture}
                alt={userName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </div>
            )}
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium" data-testid="text-profile-name">{userName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-profile-role">{displayRole}</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
            />
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 top-full mt-3 w-72 rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.18)] z-50"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                {profileData?.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt={userName}
                    className="h-11 w-11 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-base font-semibold">
                    {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
                  <p className="truncate text-xs text-slate-500">{displayRole}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={handleProfileSettings}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  data-testid="button-profile-settings"
                >
                  <User size={17} />
                  <span>Profile Edit</span>
                </button>

                <button
                  onClick={handleSystemSettings}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  data-testid="button-settings"
                >
                  <Settings size={17} />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-400 opacity-70"
                >
                  <Bell size={17} />
                  <span>Notification</span>
                </button>

                <div className="my-2 border-t border-slate-200" />

                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                  data-testid="button-admin-header-logout"
                >
                  <LogOut size={17} />
                  <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={confirmLogout}
        userName={userName}
        isLoading={logoutMutation.isPending}
      />
      
      <ProfileSettingsModal
        open={showProfileSettings}
        onOpenChange={setShowProfileSettings}
        initialView={profileModalView}
      />
    </header>
  );
}
