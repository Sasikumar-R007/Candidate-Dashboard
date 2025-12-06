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

export default function AdminTopHeader({ companyName = "Scaling Theory", onHelpClick }: AdminTopHeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();
  const employee = useEmployeeAuth();
  
  const userRole = employee?.role || 'admin';
  
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<UserActivity[]>({
    queryKey: ['/api/user-activities', userRole],
    queryFn: async () => {
      const response = await fetch(`/api/user-activities/${userRole}?limit=5`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
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
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
          }
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };
    
    loadProfileData();
  }, [employee?.role]);
  
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
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
      navigate('/');
    },
    onError: (error: any) => {
      logout();
      toast({
        title: "Logged out",
        description: "You have been signed out (session cleared locally).",
      });
      navigate('/');
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
    setShowProfileSettings(true);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 ml-16 relative z-30 sticky top-0">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {companyName}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onHelpClick}
          className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          data-testid="button-header-help"
        >
          <HelpCircle size={16} />
          <span className="text-sm">Help</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            onBlur={() => setTimeout(() => setShowUserDropdown(false), 150)}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            data-testid="button-user-dropdown"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </div>
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
            <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-4 z-50">
              <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-lg font-medium">
                    {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" data-testid="text-dropdown-name">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" data-testid="text-dropdown-email">
                      {userEmail}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" data-testid="text-dropdown-role-badge">
                      {displayRole}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Bell size={16} />
                  Notifications
                </h3>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {activitiesLoading ? (
                  <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2"></div>
                    Loading activities...
                  </div>
                ) : activities.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    <Bell size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activities</p>
                    <p className="text-xs mt-1">Activities will appear here when actions are taken</p>
                  </div>
                ) : (
                  activities.map((activity, index) => {
                    const { icon: IconComponent, bgClass, textClass } = getActivityIcon(activity.type);
                    const isLast = index === activities.length - 1;
                    
                    return (
                      <div 
                        key={activity.id} 
                        className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!isLast ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
                        data-testid={`activity-item-${activity.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 ${bgClass} rounded-full`}>
                            <IconComponent size={16} className={textClass} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {getRelativeTime(activity.createdAt)} {activity.actorName && `by ${activity.actorName}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="py-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                <button 
                  onClick={handleProfileSettings}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  data-testid="button-profile-settings"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                
                <button 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 disabled:opacity-50"
                  data-testid="button-admin-header-logout"
                >
                  <LogOut size={16} />
                  <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign out'}</span>
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
      />
    </header>
  );
}
