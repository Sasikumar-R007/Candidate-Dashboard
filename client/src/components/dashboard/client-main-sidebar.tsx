import { ChevronRight, LogOut } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import staffosLogo from "@/assets/staffos logo 2.png";
import {
  getClientPortalNav,
  normalizeClientPortalTab,
  type ClientPortalTabId,
} from "@/lib/client-portal-nav";

interface ClientMainSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExpandedChange?: (expanded: boolean) => void;
  isClientAdmin?: boolean;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export default function ClientMainSidebar({
  activeTab,
  onTabChange,
  onExpandedChange,
  isClientAdmin = false,
  mobileOpen = false,
  onMobileOpenChange,
}: ClientMainSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const { toast } = useToast();
  const { logout, beginSignOut, isSigningOut } = useAuth();

  const menuItems = useMemo(
    () => getClientPortalNav(isClientAdmin),
    [isClientAdmin],
  );

  const normalizedActive = normalizeClientPortalTab(activeTab);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/employee-logout", {});
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
      window.location.href = "/";
    },
    onError: () => {
      logout();
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out",
        description: "You have been signed out (session cleared locally).",
      });
      window.location.href = "/";
    },
  });

  const handleLogout = () => {
    setShowSignOutDialog(true);
  };

  const confirmLogout = () => {
    beginSignOut();
    logoutMutation.mutate();
  };

  const collapse = () => {
    setIsExpanded(false);
    onExpandedChange?.(false);
  };

  const expand = () => {
    setIsExpanded(true);
    onExpandedChange?.(true);
  };

  const handleTabClick = (tabId: ClientPortalTabId) => {
    onTabChange(tabId);
    if (isExpanded) {
      collapse();
    }
    onMobileOpenChange?.(false);
  };

  const renderNavButtons = (expanded: boolean) =>
    menuItems.map((item) => {
      const IconComponent = item.icon;
      const isActive = normalizedActive === item.id;

      if (expanded) {
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleTabClick(item.id)}
            className={`relative mb-1 flex w-full items-center gap-3 rounded-[6px] px-3 py-3 text-left transition-colors ${
              isActive
                ? "bg-slate-800 text-cyan-400"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            data-testid={`button-nav-expanded-${item.id}`}
          >
            {isActive && (
              <div className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-lg bg-cyan-400" />
            )}
            <IconComponent size={20} className={isActive ? "text-cyan-400" : "text-slate-300"} />
            <span className={`text-sm font-medium ${isActive ? "text-cyan-400" : "text-slate-300"}`}>
              {item.label}
            </span>
          </button>
        );
      }

      return (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            type="button"
            onClick={() => handleTabClick(item.id)}
            className={`relative mx-1 flex h-11 w-[calc(100%-0.5rem)] items-center justify-center rounded-[6px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isActive ? "bg-slate-800" : "hover:bg-slate-800"
            }`}
            data-testid={`button-nav-${item.id}`}
          >
            {isActive && <div className="absolute left-0 top-1 bottom-1 w-1 rounded-r bg-cyan-400" />}
            <IconComponent
              size={20}
              className={isActive ? "text-cyan-400" : "text-slate-400 hover:text-white"}
            />
            {hoveredItem === item.id && (
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
    });

  return (
    <>
      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[70] bg-black/40 md:hidden"
            onClick={() => onMobileOpenChange?.(false)}
            aria-label="Close mobile menu"
          />
          <div className="fixed left-0 top-0 z-[80] flex h-screen w-72 flex-col border-r border-slate-700 bg-slate-900 text-white shadow-2xl md:hidden">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-700 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <img src={staffosLogo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                <h2 className="truncate text-sm font-semibold leading-tight">Client Workspace</h2>
              </div>
              <button
                type="button"
                onClick={() => onMobileOpenChange?.(false)}
                className="rounded p-1 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label="Close menu"
                data-testid="button-mobile-menu-close"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">{renderNavButtons(true)}</nav>

            <div className="shrink-0 border-t border-slate-700 p-3">
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
                data-testid="button-client-logout-mobile"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">
                  {logoutMutation.isPending ? "Signing out…" : "Sign Out"}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {!isExpanded ? (
        <div className="hidden w-16 bg-slate-900 text-white flex-shrink-0 h-screen overflow-visible fixed left-0 top-0 z-50 md:flex flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <div className="h-16 flex items-center justify-center border-b border-slate-700">
            <img src={staffosLogo} alt="StaffOS Logo" className="w-10 h-10 object-cover rounded-full" />
          </div>

          <nav className="flex-1 py-4">{renderNavButtons(false)}</nav>

          <div className="border-t border-slate-700">
            <button
              type="button"
              onClick={expand}
              className="mx-1 my-1 flex h-10 w-[calc(100%-0.5rem)] items-center justify-center rounded-[6px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              data-testid="button-menu-toggle"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="border-t border-slate-700">
            <div
              className="relative"
              onMouseEnter={() => setHoveredItem("logout")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="mx-1 mb-1 flex h-11 w-[calc(100%-0.5rem)] items-center justify-center rounded-[6px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-50"
                data-testid="button-client-logout-collapsed"
              >
                <LogOut size={20} />
                {hoveredItem === "logout" && (
                  <div className="absolute left-full ml-3 top-1/2 z-[70] flex -translate-y-1/2 items-center">
                    <div className="h-3 w-3 rotate-45 rounded-[2px] bg-white shadow-lg" />
                    <div className="-ml-1 whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_14px_34px_rgba(15,23,42,0.18)]">
                      {logoutMutation.isPending ? "Signing out…" : "Sign Out"}
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            className="hidden md:block fixed inset-0 bg-black/30 z-[55] transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            onClick={collapse}
            aria-hidden
          />
          <div
            className="hidden md:flex fixed left-0 top-0 z-[60] h-screen w-64 flex-col border-r border-slate-700 bg-slate-900 text-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-700 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <img src={staffosLogo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                <h2 className="truncate text-sm font-semibold leading-tight">Client Workspace</h2>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-2">{renderNavButtons(true)}</nav>

            <div className="shrink-0 border-t border-slate-700 px-3 pt-3">
              <button
                type="button"
                onClick={collapse}
                className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                data-testid="button-client-close-expanded"
              >
                <ChevronRight size={20} className="rotate-180" />
                <span className="text-sm font-medium">Close menu</span>
              </button>
            </div>

            <div className="shrink-0 px-3 pb-3">
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
                data-testid="button-client-logout-expanded"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">
                  {logoutMutation.isPending ? "Signing out…" : "Sign Out"}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={confirmLogout}
        isLoading={logoutMutation.isPending || isSigningOut}
      />
    </>
  );
}
