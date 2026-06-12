import { Link, useLocation } from "wouter";
import { Users, FileText, GitBranch, Trophy, ChevronRight, LogOut, Zap } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import staffosLogo from "@/assets/staffos logo 2.png";

interface TeamLeaderMainSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TeamLeaderMainSidebar({ activeTab, onTabChange }: TeamLeaderMainSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { logout, beginSignOut, isSigningOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Team', icon: Users },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'performance', label: 'Performance', icon: Trophy },
    { id: 'nudges', label: 'Nudges', icon: Zap },
  ];

  // Logout mutation for employees (team leaders)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/employee-logout', {});
      return await res.json();
    },
    onSuccess: () => {
      // Use auth context logout to clear session
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
      // Even on error, clear session locally
      logout();
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
    setShowSignOutDialog(true);
  };

  const confirmLogout = () => {
    beginSignOut();
    logoutMutation.mutate();
  };

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Main Sidebar */}
      <div className="w-16 bg-slate-900 text-white flex-shrink-0 h-screen overflow-visible fixed left-0 top-0 z-50 flex flex-col">
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <div className="flex items-center gap-2">
            <img 
              src={staffosLogo} 
              alt="StaffOS Logo" 
              className="w-10 h-10 object-cover rounded-full"
            />
          </div>
        </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={() => handleTabClick(item.id)}
                className={`w-full h-12 flex items-center justify-center transition-all duration-200 relative group transform hover:scale-105 ${
                  activeTab === item.id 
                    ? 'bg-slate-800 text-cyan-400 shadow-lg' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white hover:shadow-md'
                }`}
                data-testid={`button-nav-${item.id}`}
              >
                {/* Active indicator */}
                {activeTab === item.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400"></div>
                )}
                
                <IconComponent size={20} />
                
                {/* Tooltip */}
                {hoveredItem === item.id && !isExpanded && (
                  <div className="absolute left-full ml-3 top-1/2 z-[70] flex -translate-y-1/2 items-center">
                    <div className="h-3 w-3 rotate-45 rounded-[2px] bg-white shadow-lg" />
                    <div className="-ml-1 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
                      {item.label}
                    </div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
    </nav>

        {/* Logout Button for Collapsed State */}
        <div className="border-t border-slate-700">
          <div
            className="relative"
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full h-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              data-testid="button-team-leader-logout-collapsed"
            >
              <LogOut size={20} />
              
              {/* Tooltip */}
              {hoveredItem === 'logout' && !isExpanded && (
                <div className="absolute left-full ml-3 top-1/2 z-[70] flex -translate-y-1/2 items-center">
                  <div className="h-3 w-3 rotate-45 rounded-[2px] bg-white shadow-lg" />
                  <div className="-ml-1 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
                    {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Menu Toggle */}
        <div className="border-t border-slate-700">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            data-testid="button-menu-toggle"
          >
            <ChevronRight size={20} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

    {/* Expanded Sidebar Overlay */}
    {isExpanded && (
      <div className="fixed inset-0 z-40 flex">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50" 
          onClick={() => setIsExpanded(false)}
        ></div>
        
        {/* Expanded Menu */}
        <div className="relative w-64 bg-slate-900 text-white h-screen flex flex-col shadow-xl ml-16">
          {/* Logo Section */}
          <div className="h-16 flex items-center px-4 border-b border-slate-700 gap-2">
            <img 
              src={staffosLogo} 
              alt="StaffOS Logo" 
              className="w-10 h-10 object-cover rounded-full"
            />
            <span className="text-lg font-semibold">StaffOS</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-4">
            {menuItems.map((item) => {
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full h-12 flex items-center px-4 transition-colors relative ${
                    activeTab === item.id 
                      ? 'bg-slate-800 text-cyan-400 border-r-2 border-cyan-400' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  data-testid={`button-nav-expanded-${item.id}`}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sign Out Section */}
          <div className="border-t border-slate-700">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full h-12 flex items-center px-4 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              data-testid="button-sign-out"
            >
              <LogOut size={16} className="mr-3" />
              <span className="text-sm font-medium">{logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>
      )}
    
    <SignOutDialog
      open={showSignOutDialog}
      onOpenChange={setShowSignOutDialog}
      onConfirm={confirmLogout}
      userName={undefined}
      isLoading={logoutMutation.isPending || isSigningOut}
    />
    </>
  );
}