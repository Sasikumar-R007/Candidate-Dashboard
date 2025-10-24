import { useState } from "react";
import { ChevronDown, User, Settings, LogOut, MessageCircle, Bell, Briefcase } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { ProfileSettingsModal } from "@/components/dashboard/modals/profile-settings-modal";

interface ProfileMenuProps {
  userName: string;
  userRole?: string;
  companyName?: string;
  logoutEndpoint: string;
  profilePicture?: string;
  onChatClick?: () => void;
  showChatInDropdown?: boolean;
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
          {/* Notifications Header */}
          <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Bell size={18} />
              Notifications
            </h3>
          </div>
          
          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {/* New Messages Notification */}
            <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <MessageCircle size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New message from recruiter</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your application for Cloud Engineer has been reviewed</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 hours ago</p>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>

            {/* New Job Notification */}
            <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <Briefcase size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New job matches your profile</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Senior Frontend Developer at Google Technologies Inc.</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">5 hours ago</p>
                </div>
              </div>
            </div>

            {/* Application Status Update */}
            <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Briefcase size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Application status updated</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your application for Backend Developer is under review</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Menu Items */}
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
