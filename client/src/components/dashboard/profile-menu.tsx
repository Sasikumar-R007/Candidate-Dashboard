import { useState } from "react";
import { ChevronDown, User, Settings, LogOut, MessageCircle, Bell, Briefcase, Users, CheckCircle, Calendar } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { ProfileSettingsModal } from "@/components/dashboard/modals/profile-settings-modal";
import type { UserActivity } from "@shared/schema";

interface ProfileMenuProps {
  userName: string;
  userRole?: string;
  companyName?: string;
  logoutEndpoint: string;
  profilePicture?: string;
  onChatClick?: () => void;
  showChatInDropdown?: boolean;
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

export default function ProfileMenu({ 
  userName,
  userRole,
  companyName,
  logoutEndpoint,
  profilePicture,
  onChatClick,
  showChatInDropdown = false
}: ProfileMenuProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();
  
  const role = userRole || 'recruiter';
  
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<UserActivity[]>({
    queryKey: ['/api/user-activities', role],
    queryFn: async () => {
      const response = await fetch(`/api/user-activities/${role}?limit=5`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
    refetchInterval: 30000,
  });
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', logoutEndpoint, {});
      return await res.json();
    },
    onSuccess: () => {
      logout();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
      window.location.href = '/';
    },
    onError: (error: any) => {
      logout();
      toast({
        title: "Logged out",
        description: "You have been signed out (session cleared locally).",
      });
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
    setShowProfileSettings(true);
  };

  const handleChatClick = () => {
    setShowUserDropdown(false);
    onChatClick?.();
  };

  const getUserInitials = () => {
    return userName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowUserDropdown(!showUserDropdown)}
        onBlur={() => setTimeout(() => setShowUserDropdown(false), 150)}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        data-testid="button-user-dropdown"
      >
        {profilePicture ? (
          <img 
            src={profilePicture} 
            alt={userName} 
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {getUserInitials()}
          </div>
        )}
        <span className="text-sm font-medium">{userName}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
        />
      </button>

      {showUserDropdown && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-4 z-50">
          <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Bell size={18} />
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
              data-testid="button-settings"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
            
            <hr className="my-2 border-gray-200 dark:border-gray-600" />
            
            <button 
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 disabled:opacity-50"
              data-testid="button-logout"
            >
              <LogOut size={16} />
              <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign out'}</span>
            </button>
          </div>
        </div>
      )}
      
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
        onChatClick={onChatClick}
      />
    </div>
  );
}
