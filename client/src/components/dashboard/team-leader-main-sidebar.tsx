import { Users, FileText, GitBranch, Trophy, ChevronRight, LogOut, Zap } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { SidebarBrand } from "@/components/dashboard/sidebar-brand";
import { SidebarNavLabel } from "@/components/dashboard/sidebar-nav-label";
import { SidebarBackdrop } from "@/components/dashboard/sidebar-backdrop";

interface TeamLeaderMainSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TeamLeaderMainSidebar({ activeTab, onTabChange }: TeamLeaderMainSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const { toast } = useToast();
  const { logout, beginSignOut, isSigningOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Team', icon: Users },
    { id: 'requirements', label: 'Requirements', icon: FileText },
    { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
    { id: 'performance', label: 'Performance', icon: Trophy },
    { id: 'nudges', label: 'Nudges', icon: Zap },
  ];

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/employee-logout', {});
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
        className={`fixed left-0 top-0 z-50 flex h-screen flex-shrink-0 flex-col overflow-visible bg-slate-900 text-white shadow-xl transition-[width] duration-300 ease-in-out ${
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
                    <IconComponent size={20} className="shrink-0" />
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
            data-testid="button-menu-toggle"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronRight
              size={18}
              className={`transform transition-transform duration-300 ease-in-out ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>

          <button
            onClick={handleLogout}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            disabled={logoutMutation.isPending}
            className={`relative flex h-12 w-full items-center text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50 ${
              isExpanded ? "px-4" : "justify-center px-0"
            }`}
            data-testid="button-team-leader-logout-collapsed"
          >
            <div className={`flex items-center ${isExpanded ? "gap-3" : "justify-center"}`}>
              <LogOut size={20} className="shrink-0" />
              <SidebarNavLabel expanded={isExpanded}>
                {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
              </SidebarNavLabel>
            </div>

            {hoveredItem === 'logout' && !isExpanded && (
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
        userName={undefined}
        isLoading={logoutMutation.isPending || isSigningOut}
      />
    </>
  );
}
