import { Link, useLocation } from "wouter";
import { User, Briefcase, Settings, LogOut, UserCircle, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useCandidateAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();
  const candidate = useCandidateAuth();

  const menuItems = [
    { id: 'my-jobs', label: 'My Jobs', icon: Briefcase },
    { id: 'job-preferences', label: 'Job Preferences', icon: Settings },
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'job-board', label: 'Job Board', icon: Briefcase },
  ];

  // Logout mutation for candidates
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/candidate-logout', {});
      return await res.json();
    },
    onSuccess: () => {
      // Use auth context logout
      logout();
      
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
    setShowSignOutDialog(true);
  };

  const confirmLogout = () => {
    logoutMutation.mutate();
    setShowSignOutDialog(false);
  };

  return (
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
                onClick={() => onTabChange(item.id)}
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
                {hoveredItem === item.id && (
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
      
      {/* Sign Out Button */}
      <div className="pb-4">
        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('sign-out')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full h-12 flex items-center justify-center transition-all duration-200 relative group transform hover:scale-105 hover:bg-slate-800 text-slate-400 hover:text-white hover:shadow-md disabled:opacity-50"
            data-testid="button-nav-sign-out"
          >
            <LogOut size={20} />
            
            {/* Tooltip */}
            {hoveredItem === 'sign-out' && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded whitespace-nowrap z-50 shadow-lg border border-slate-600">
                {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-600"></div>
              </div>
            )}
          </button>
        </div>
      </div>
      
      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={confirmLogout}
        userName={candidate?.fullName}
        isLoading={logoutMutation.isPending}
      />
    </div>
  );
}
