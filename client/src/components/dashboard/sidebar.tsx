import { Briefcase, Settings, LogOut, UserCircle, LayoutGrid, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useCandidateAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { SidebarBrand } from "@/components/dashboard/sidebar-brand";
import { SidebarNavLabel } from "@/components/dashboard/sidebar-nav-label";
import { SidebarBackdrop } from "@/components/dashboard/sidebar-backdrop";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const { toast } = useToast();
  const { logout, beginSignOut, isSigningOut } = useAuth();
  const candidate = useCandidateAuth();

  const { data: candidateNudges = [] } = useQuery<any[]>({
    queryKey: ['/api/candidate/nudges'],
    enabled: !!candidate,
  });

  const hasUnreadNudges = candidateNudges.some(n => (n.isResponded || n.message) && !n.isRead);

  const menuItems = [
    { id: 'my-jobs', label: 'My Jobs', icon: LayoutGrid },
    { id: 'edit-view', label: 'Profile', icon: UserCircle },
    { id: 'job-board', label: 'Job Board', icon: Briefcase },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/candidate-logout', {});
      return await res.json();
    },
    onSuccess: () => {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
      window.location.href = '/';
    },
    onError: () => {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out",
        description: "You have been signed out (session cleared locally).",
      });
      window.location.href = '/';
    }
  });

  const collapse = () => setIsExpanded(false);

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
      collapse();
    }
  };

  return (
    <>
      <SidebarBackdrop open={isExpanded} onClose={collapse} />

      <div
        className={`hidden lg:flex fixed left-0 top-0 z-50 h-screen flex-shrink-0 flex-col overflow-visible bg-slate-900 text-white shadow-xl transition-[width] duration-300 ease-in-out ${
          isExpanded ? "w-64" : "w-16"
        }`}
      >
        <SidebarBrand expanded={isExpanded} />

        <nav className="flex-1 overflow-visible py-4">
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
                  className={`relative flex h-12 w-full items-center transition-colors duration-200 ${
                    isExpanded ? "px-4" : "justify-center px-0"
                  } ${
                    isActive
                      ? "bg-slate-800 text-cyan-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                  data-testid={`button-nav-${item.id}`}
                >
                  {isActive && (
                    <div className="absolute bottom-0 left-0 top-0 w-1 bg-cyan-400" />
                  )}

                  <div className={`flex items-center ${isExpanded ? "gap-4" : "justify-center"}`}>
                    <div className="relative shrink-0">
                      <IconComponent size={20} />
                      {item.id === 'my-jobs' && hasUnreadNudges && (
                        <span className="absolute -right-1.5 -top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                      )}
                    </div>
                    <SidebarNavLabel expanded={isExpanded}>{item.label}</SidebarNavLabel>
                  </div>

                  {hoveredItem === item.id && !isExpanded && (
                    <div className="absolute left-full top-1/2 z-[70] ml-3 flex -translate-y-1/2 items-center">
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

        <div className="border-t border-slate-700">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex h-10 w-full items-center justify-center text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronRight
              size={18}
              className={`transform transition-transform duration-300 ease-in-out ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>

          <button
            onClick={handleLogout}
            onMouseEnter={() => setHoveredItem('sign-out')}
            onMouseLeave={() => setHoveredItem(null)}
            disabled={logoutMutation.isPending}
            className={`relative flex h-12 w-full items-center text-slate-400 transition-colors hover:bg-red-950/20 hover:text-red-400 disabled:opacity-50 ${
              isExpanded ? "px-4" : "justify-center px-0"
            }`}
            data-testid="button-nav-sign-out"
          >
            <div className={`flex items-center ${isExpanded ? "gap-3" : "justify-center"}`}>
              <LogOut size={18} className="shrink-0" />
              <SidebarNavLabel expanded={isExpanded}>
                {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
              </SidebarNavLabel>
            </div>

            {hoveredItem === 'sign-out' && !isExpanded && (
              <div className="absolute left-full top-1/2 z-[70] ml-3 flex -translate-y-1/2 items-center">
                <div className="h-3 w-3 rotate-45 rounded-[2px] bg-white shadow-lg" />
                <div className="-ml-1 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
                  {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                </div>
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
        isLoading={logoutMutation.isPending || isSigningOut}
      />
    </>
  );
}
