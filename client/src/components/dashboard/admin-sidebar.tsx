import { Link, useLocation } from "wouter";
import { Users, FileText, GitBranch, BarChart3, Database, Trophy, FileBarChart, Settings, ChevronRight, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useEmployeeAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
// import scalingXLogo from "@/assets/images/scaling-x-logo.png";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();
  const employee = useEmployeeAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Team', icon: Users },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'master-data', label: 'Master Data', icon: Database },
    { id: 'performance', label: 'Performance', icon: Trophy },
    { id: 'report', label: 'Report', icon: FileBarChart },
    { id: 'user-management', label: 'User Management', icon: Settings }
  ];

  // Logout mutation for employees (admin)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/employee-logout', {});
      return await res.json();
    },
    onSuccess: () => {
      // Use auth context logout
      logout();
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to logout. Please try again.",
        variant: "destructive"
      });
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
      {/* Main Sidebar */}
      <div className="w-16 bg-slate-900 text-white flex-shrink-0 h-screen overflow-hidden fixed left-0 top-0 z-50 flex flex-col">
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-green-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">X</span>
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

      {/* Expand Button */}
      <div className="border-t border-slate-700 py-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={() => setHoveredItem('expand')}
          onMouseLeave={() => setHoveredItem(null)}
          className="w-full h-8 flex items-center justify-center transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800 relative transform hover:scale-110"
        >
          <ChevronRight size={16} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          
          {/* Tooltip */}
          {hoveredItem === 'expand' && !isExpanded && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded whitespace-nowrap z-50 shadow-lg border border-slate-600">
              Expand Menu
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-600"></div>
            </div>
          )}
        </button>
      </div>

    </div>

    {/* Expanded Overlay */}
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
          <div className="h-16 flex items-center px-4 border-b border-slate-700">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 via-blue-500 to-green-400 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="text-lg font-semibold">ScalingX</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-4">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 transition-colors relative ${
                    activeTab === item.id 
                      ? 'bg-slate-800 text-cyan-400 border-r-2 border-cyan-400' 
                      : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  data-testid={`button-nav-expanded-${item.id}`}
                >
                  <IconComponent size={20} className="mr-3" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="border-t border-slate-700 p-4">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors rounded disabled:opacity-50"
              data-testid="button-admin-logout"
            >
              <LogOut size={16} className="mr-2" />
              {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>

        </div>
      </div>
    )}
    
    <SignOutDialog
      open={showSignOutDialog}
      onOpenChange={setShowSignOutDialog}
      onConfirm={confirmLogout}
      userName={employee?.name}
      isLoading={logoutMutation.isPending}
    />
    </>
  );
}