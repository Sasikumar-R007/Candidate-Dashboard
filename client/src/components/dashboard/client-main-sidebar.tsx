import { Link, useLocation } from "wouter";
import { Briefcase, FileText, GitBranch, MessageCircle, ChevronRight, LogOut, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import staffosLogo from "@/assets/staffos logo 2.png";

interface ClientMainSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
}

export default function ClientMainSidebar({ activeTab, onTabChange, onExpandedChange }: ClientMainSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
    { id: 'requirements', label: 'Pipeline', icon: GitBranch },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'chat', label: 'Chat System', icon: MessageCircle }
  ];

  // Logout mutation for employees (clients)
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
    logoutMutation.mutate();
    setShowSignOutDialog(false);
  };

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Main Sidebar - Collapsed State */}
      <div className="w-16 bg-slate-900 text-white flex-shrink-0 h-screen overflow-hidden fixed left-0 top-0 z-50 flex flex-col">
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <img 
            src={staffosLogo} 
            alt="StaffOS Logo" 
            className="w-10 h-10 object-cover rounded-full"
          />
        </div>

        {/* Navigation Items - Icons Only */}
        <nav className="flex-1 py-4">
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
                  className={`w-full h-12 flex items-center justify-center transition-all duration-200 relative ${
                    isActive 
                      ? 'bg-slate-800' 
                      : 'hover:bg-slate-800'
                  }`}
                  data-testid={`button-nav-${item.id}`}
                >
                  {/* Active indicator - left vertical bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400"></div>
                  )}
                  
                  {/* Single Icon */}
                  <IconComponent 
                    size={20} 
                    className={isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}
                  />
                  
                  {/* Tooltip - Only show when collapsed */}
                  {hoveredItem === item.id && !isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded whitespace-nowrap z-50 shadow-lg border border-slate-600">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-600"></div>
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
              data-testid="button-client-logout-collapsed"
            >
              <LogOut size={20} />
              
              {/* Tooltip */}
              {hoveredItem === 'logout' && !isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded whitespace-nowrap z-50 shadow-lg border border-slate-600">
                  {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-600"></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Menu Toggle */}
        <div className="border-t border-slate-700">
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              onExpandedChange?.(!isExpanded);
            }}
            className="w-full h-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            data-testid="button-menu-toggle"
          >
            <ChevronRight size={20} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dim Overlay when sidebar is expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => {
            setIsExpanded(false);
            onExpandedChange?.(false);
          }}
        />
      )}

    {/* Expanded Sidebar Overlay - Icons + Text */}
    {isExpanded && (
      <div className="fixed left-16 top-0 h-screen w-64 bg-slate-900 text-white z-40 shadow-2xl border-r border-slate-700">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold">Client Menu</h2>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>
          </div>

          {/* Navigation Items - Labels Only (Icons hidden when expanded) */}
          <nav className="flex-1 py-4 px-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-2 ${
                    isActive
                      ? 'bg-slate-800'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  data-testid={`button-nav-expanded-${item.id}`}
                >
                  <span className={`font-medium ${isActive ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button for Expanded State */}
          <div className="border-t border-slate-700 p-4">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
              data-testid="button-client-logout-expanded"
            >
              <LogOut size={20} />
              <span className="font-medium">
                {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
              </span>
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Sign Out Dialog */}
      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={confirmLogout}
      />
    </>
  );
}

