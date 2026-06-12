import { useLocation } from "wouter";
import { Users, FileText, GitBranch, BarChart3, Database, Trophy, FileBarChart, ChevronRight, User, LogOut, Building2, UserCog, Zap } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useEmployeeAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import staffosLogo from "@/assets/staffos logo 2.png";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasUnreadNudges?: boolean;
}

export default function AdminSidebar({ activeTab, onTabChange, hasUnreadNudges = false }: AdminSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { logout, beginSignOut, isSigningOut } = useAuth();
  const employee = useEmployeeAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Team', icon: Users },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'master-data', label: 'Master Data', icon: Database },
    { id: 'performance', label: 'Performance', icon: Trophy },
    { id: 'report', label: 'Report', icon: FileBarChart },
    { id: 'nudges', label: 'Nudges', icon: Zap },
    { id: 'user-management', label: 'User Management', icon: UserCog },
  ];

  // Logout mutation for employees (admin)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/employee-logout', {});
      return await res.json();
    },
    onSuccess: () => {
      // Use auth context logout to clear session
      logout();
      
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
  };

  return (
    <>
      {/* Main Sidebar */}
      <div 
        className={`${isExpanded ? 'w-64' : 'w-16'} bg-slate-900 text-white flex-shrink-0 h-screen transition-all duration-300 fixed left-0 top-0 z-50 flex flex-col shadow-xl overflow-visible`}
      >
        {/* Logo Section */}
        <div className={`h-16 flex items-center ${isExpanded ? 'px-4' : 'justify-center'} border-b border-slate-700 gap-3 overflow-hidden`}>
          <img 
            src={staffosLogo} 
            alt="StaffOS Logo" 
            className="w-10 h-10 object-cover rounded-full flex-shrink-0"
          />
          {isExpanded && (
            <span className="text-lg font-bold whitespace-nowrap opacity-100 transition-opacity duration-300">StaffOS</span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-visible">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <button
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full h-12 flex items-center transition-all duration-200 relative group ${
                    isExpanded ? 'px-4' : 'justify-center'
                  } ${
                    isActive 
                      ? 'bg-slate-800 text-cyan-400' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  data-testid={`button-nav-${item.id}`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400"></div>
                  )}
                  
                  <div className={`flex items-center gap-4 ${!isExpanded && 'justify-center w-full'}`}>
                    <div className="relative">
                      <IconComponent size={20} className="flex-shrink-0" />
                      {item.id === 'nudges' && hasUnreadNudges && (
                        <span className="absolute -right-1.5 -top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                      )}
                    </div>
                    {isExpanded && (
                      <span className="text-sm font-medium whitespace-nowrap transition-all duration-300">
                        {item.label}
                      </span>
                    )}
                  </div>
                  
                  {/* Tooltip (only when collapsed) */}
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

        {/* Bottom Section: Expand & Logout */}
        <div className="border-t border-slate-700">
          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ChevronRight size={18} className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            disabled={logoutMutation.isPending}
            className={`relative w-full h-12 flex items-center ${isExpanded ? 'px-4' : 'justify-center'} text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-colors disabled:opacity-50 group`}
            data-testid="button-admin-logout"
          >
            <LogOut size={18} className={`${isExpanded ? 'mr-3' : ''}`} />
            {isExpanded && (
              <span className="text-sm font-medium whitespace-nowrap">
                {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
              </span>
            )}
            
            {/* Sign Out Tooltip (only when collapsed) */}
            {hoveredItem === 'logout' && !isExpanded && (
              <div className="absolute left-full ml-3 top-1/2 z-[70] flex -translate-y-1/2 items-center">
                <div className="h-3 w-3 rotate-45 rounded-[2px] bg-white shadow-lg" />
                <div className="-ml-1 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
                  Sign Out
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden" 
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={confirmLogout}
        userName={employee?.name}
        isLoading={logoutMutation.isPending || isSigningOut}
      />
    </>
  );
}
