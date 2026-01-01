import { Link, useLocation } from "wouter";
import { Users, FileText, GitBranch, Trophy, MessageCircle, ChevronRight, User, LogOut, Bell, Briefcase, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TeamLeaderMainSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TeamLeaderMainSidebar({ activeTab, onTabChange }: TeamLeaderMainSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const menuItems = [
    { id: 'dashboard', label: 'Team', icon: Users },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'performance', label: 'Performance', icon: Trophy },
    { id: 'chat', label: 'Chat', icon: MessageCircle }
  ];

  // Logout mutation for employees (team leaders)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/employee-logout', {});
      return await res.json();
    },
    onSuccess: () => {
      // Clear any stored session data
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
      
      // Navigate to home page
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
    logoutMutation.mutate();
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === 'chat') {
      navigate('/chat');
      if (isExpanded) {
        setIsExpanded(false);
      }
    } else {
      onTabChange(tabId);
      if (isExpanded) {
        setIsExpanded(false);
      }
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
          <div className="h-16 flex items-center px-4 border-b border-slate-700">
            <span className="text-lg font-semibold">ScalingX</span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-4">
            {menuItems.map((item) => {
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
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Section with Dropdown */}
          <div className="border-t border-slate-700 p-4 relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              onBlur={() => setTimeout(() => setShowUserDropdown(false), 150)}
              className="flex items-center justify-between w-full mb-3 hover:bg-slate-800 p-2 rounded transition-colors"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center mr-3">
                  <User size={16} className="text-slate-900" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Team Leader</p>
                  <p className="text-xs text-slate-400">Admin Panel</p>
                </div>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* User Dropdown Menu with Notifications */}
            {showUserDropdown && (
              <div className="absolute bottom-full left-0 mb-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-4 z-50">
                {/* Notifications Header */}
                <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Bell size={18} />
                    Notifications
                  </h3>
                </div>
                
                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {/* Team Assignment Notification */}
                  <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                        <Users size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New team member assigned</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kavitha has been added to your team</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 hours ago</p>
                      </div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Requirement Update */}
                  <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                        <Briefcase size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Requirement status updated</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Backend Developer requirement marked as high priority</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">4 hours ago</p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Alert */}
                  <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                        <Trophy size={16} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Performance target achieved</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your team reached this month's hiring goal</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  
                  <hr className="my-2 border-gray-200 dark:border-gray-600" />
                  
                  <button 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 disabled:opacity-50"
                    data-testid="button-team-leader-logout"
                  >
                    <LogOut size={16} />
                    <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}