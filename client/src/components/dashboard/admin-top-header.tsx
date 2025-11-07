import { useState, useEffect } from "react";
import { ChevronDown, User, Settings, LogOut, HelpCircle, Bell, MessageCircle, Briefcase } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useEmployeeAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { ProfileSettingsModal } from "@/components/dashboard/modals/profile-settings-modal";

interface AdminTopHeaderProps {
  companyName?: string;
  onHelpClick?: () => void;
}

export default function AdminTopHeader({ companyName = "Gumlat Marketing Private Limited", onHelpClick }: AdminTopHeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();
  const employee = useEmployeeAuth();
  
  // Load role-specific profile data
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
  const displayCompanyName = companyName;
  
  // Logout mutation for employees (admin)
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
      // Even if API fails, clear the session to ensure user is logged out
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
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 relative z-30 sticky top-0">
      {/* Left - Company Name */}
      <div className="flex items-center pl-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {companyName}
        </h1>
      </div>

      {/* Right - Help and User Dropdown */}
      <div className="flex items-center gap-4">
        {/* Help Button */}
        <button 
          onClick={onHelpClick}
          className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          data-testid="button-header-help"
        >
          <HelpCircle size={16} />
          <span className="text-sm">Help</span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            onBlur={() => setTimeout(() => setShowUserDropdown(false), 150)}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            data-testid="button-user-dropdown"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </div>
            <span className="text-sm font-medium">{userName}</span>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
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
                {/* New Requirement Notification */}
                <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Briefcase size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New requirement added</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Senior Full Stack Developer at TechCorp</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 hour ago</p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>

                {/* Team Update Notification */}
                <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                      <MessageCircle size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Team member message</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">New candidate submitted by Kavitha</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">3 hours ago</p>
                    </div>
                  </div>
                </div>

                {/* Pipeline Update */}
                <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                      <Briefcase size={16} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Pipeline update</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3 candidates moved to final round</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
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