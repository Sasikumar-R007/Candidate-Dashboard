import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, User, Settings, LogOut, HelpCircle, Bell, Zap, Trophy, Briefcase, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useEmployeeAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { Badge } from "@/components/ui/badge";

type PortalNudge = {
  id: string;
  candidateName?: string | null;
  jobTitle?: string | null;
  createdAt?: string | Date | null;
  isRead?: boolean | null;
};

interface SimpleClientHeaderProps {
  companyName?: string;
  clientName?: string;
  clientEmail?: string;
  displayEmployeeId?: string | null;
  isClientAdmin?: boolean;
  onHelpClick?: () => void;
  /** Active client nudges from /api/nudges — used when feed is still loading or empty */
  portalNudges?: PortalNudge[];
  onOpenNudges?: () => void;
  onOpenClosures?: () => void;
  onOpenProfileSettings?: () => void;
  onOpenChangePassword?: () => void;
}

type EmployeeNotificationItem = {
  id: string;
  line: string;
  createdAt?: string | null;
  isUnread?: boolean;
};

type EmployeeNotificationFeed = {
  role: string;
  newRequirements: EmployeeNotificationItem[];
  nudges: EmployeeNotificationItem[];
  escalatedNudges: EmployeeNotificationItem[];
  closures: EmployeeNotificationItem[];
  newCandidateApplied: EmployeeNotificationItem[];
  unreadCount: number;
};

export default function SimpleClientHeader({ 
  companyName = "Loading...",
  clientName,
  clientEmail,
  displayEmployeeId,
  isClientAdmin = false,
  onHelpClick,
  portalNudges = [],
  onOpenNudges,
  onOpenClosures,
  onOpenProfileSettings,
  onOpenChangePassword,
}: SimpleClientHeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState<string>('all');
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();
  const employee = useEmployeeAuth();
  
  const userName = clientName || employee?.name || "Client User";
  const userEmail = clientEmail || employee?.email || "";

  const {
    data: employeeFeed,
    isLoading: feedLoading,
    isError: feedError,
    refetch: refetchNotificationFeed,
  } = useQuery<EmployeeNotificationFeed>({
    queryKey: ["/api/employee/notifications-feed"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/employee/notifications-feed", {});
      return await res.json();
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  useEffect(() => {
    if (showNotifications) {
      void refetchNotificationFeed();
    }
  }, [showNotifications, refetchNotificationFeed]);

  const notificationTabs = useMemo(
    () => [
      { id: "all", label: "All" },
      { id: "newProfiles", label: "New Profiles" },
      { id: "nudges", label: "Nudges" },
      { id: "closures", label: "Closures" },
    ],
    []
  );

  useEffect(() => {
    if (!notificationTabs.some((tab) => tab.id === notificationTab)) {
      setNotificationTab(notificationTabs[0]?.id || "all");
    }
  }, [notificationTabs, notificationTab]);

  const portalNudgeItems = useMemo<EmployeeNotificationItem[]>(() => {
    return (portalNudges || []).map((n) => ({
      id: n.id,
      line: `[${n.candidateName || "Candidate"} - ${n.jobTitle || "Role"}]`,
      createdAt:
        n.createdAt == null
          ? null
          : typeof n.createdAt === "string"
            ? n.createdAt
            : n.createdAt.toISOString(),
      isUnread: !n.isRead,
    }));
  }, [portalNudges]);

  const allNotificationRows = useMemo(() => {
    const rows: Array<{ key: string; kind: string; line: string; createdAt?: string | null; isUnread?: boolean }> = [];
    const pushRows = (kind: string, items: EmployeeNotificationItem[]) => {
      items.forEach((item) =>
        rows.push({
          key: `${kind}-${item.id}`,
          kind,
          line: item.line,
          createdAt: item.createdAt,
          isUnread: item.isUnread,
        }),
      );
    };
    const feedNudges = employeeFeed?.nudges?.length ? employeeFeed.nudges : portalNudgeItems;
    pushRows("newProfile", employeeFeed?.newCandidateApplied || []);
    pushRows("nudge", feedNudges);
    pushRows("closure", employeeFeed?.closures || []);
    return rows.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [employeeFeed, portalNudgeItems]);

  const notificationRows = useMemo(() => {
    if (notificationTab === "all") return allNotificationRows;
    return allNotificationRows.filter(
      (row) =>
        (notificationTab === "newProfiles" && row.kind === "newProfile") ||
        (notificationTab === "nudges" && row.kind === "nudge") ||
        (notificationTab === "closures" && row.kind === "closure"),
    );
  }, [allNotificationRows, notificationTab]);

  const headerUnreadCount = useMemo(() => {
    const fromRows = allNotificationRows.filter((r) => r.isUnread).length;
    if (employeeFeed && !feedError) {
      return Math.max(employeeFeed.unreadCount, fromRows);
    }
    return fromRows;
  }, [allNotificationRows, employeeFeed, feedError]);
  
  // Logout mutation for client (employee)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return await res.json();
    },
    onSuccess: () => {
      logout();
      // Clear any stored session data
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
      // Navigate to home page and prevent back navigation
      window.location.href = '/employer-login';
    },
    onError: () => {
      logout();
      // Clear any stored session data
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: "Logged out",
        description: "You have been signed out (session cleared locally).",
      });
      // Navigate to home page and prevent back navigation
      window.location.href = '/employer-login';
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
    onOpenProfileSettings?.();
  };

  const handlePasswordChange = () => {
    setShowUserDropdown(false);
    onOpenChangePassword?.();
  };
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Company + role badge */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{companyName}</h1>
            {isClientAdmin && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 shrink-0">
                Client Admin
              </Badge>
            )}
          </div>
          {displayEmployeeId && (
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{displayEmployeeId}</p>
          )}
        </div>
        
        {/* Right side - Help, Notifications and User Profile */}
        <div className="flex items-center gap-4">
          {/* Help Button */}
          <button 
            onClick={onHelpClick}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
            data-testid="button-header-help"
          >
            <HelpCircle size={16} />
            <span className="text-sm">Help</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(false);
                setShowNotifications((prev) => !prev);
              }}
              className="relative flex items-center justify-center h-10 w-10 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              data-testid="button-client-notifications"
            >
              <Bell size={18} />
              {headerUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {headerUnreadCount}
                </span>
              )}
            </button>
          </div>
          
          {/* User Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 rounded-lg"
              data-testid="button-client-user-dropdown"
            >
              {/* Company Initial Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {companyName && companyName !== 'Loading...' ? companyName.charAt(0).toUpperCase() : 'C'}
              </div>
              <span className="text-sm font-medium">{userName}</span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl py-4 z-50">
                {/* Profile Section */}
                <div className="px-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    {/* Company Initial Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                      {companyName && companyName !== 'Loading...' ? companyName.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-semibold text-gray-900 truncate">
                        {userName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        Client - {companyName}
                      </div>
                      {userEmail && (
                        <div className="text-xs text-gray-400 truncate">
                          {userEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-2">
                  <button 
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleProfileSettings}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    data-testid="button-client-profile-settings"
                  >
                    <User size={16} />
                    <span>Profile Settings</span>
                  </button>

                  <button 
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handlePasswordChange}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    data-testid="button-client-change-password"
                  >
                    <Settings size={16} />
                    <span>Change Password</span>
                  </button>
                  
                  <hr className="my-2 border-gray-200" />
                  
                  <button 
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 disabled:opacity-50"
                    data-testid="button-client-header-logout"
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

      {showNotifications && (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setShowNotifications(false)}
            aria-label="Close notifications"
          />
          <div className="fixed right-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-[min(96vw,720px)] flex-col rounded-l-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>

            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {notificationTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setNotificationTab(tab.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                      notificationTab === tab.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {feedLoading && (
                <p className="px-3 py-8 text-center text-sm text-slate-500">Loading…</p>
              )}
              {feedError && !feedLoading && !employeeFeed && portalNudgeItems.length === 0 && (
                <div className="px-3 py-6 text-center">
                  <p className="text-sm text-amber-700">Notifications could not be loaded.</p>
                  <button
                    type="button"
                    onClick={() => void refetchNotificationFeed()}
                    className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Try again
                  </button>
                </div>
              )}
              {!feedLoading &&
                (!feedError || employeeFeed || portalNudgeItems.length > 0) &&
                notificationRows.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-slate-500">
                  {notificationTab === "all" && "No notifications yet."}
                  {notificationTab === "newProfiles" && "No new profile notifications yet."}
                  {notificationTab === "nudges" && "No nudge notifications yet."}
                  {notificationTab === "closures" && "No closure notifications yet."}
                </p>
              )}
              {!feedLoading &&
                (!feedError || employeeFeed || portalNudgeItems.length > 0) &&
                notificationRows.length > 0 && (
                <div className="space-y-3">
                  {notificationRows.map((row) => {
                    const icon = row.kind === "newProfile" ? Briefcase : row.kind === "closure" ? Trophy : Zap;
                    const Icon = icon;
                    return (
                      <button
                        key={row.key}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50 ${
                          row.isUnread ? "border-cyan-200 bg-cyan-50/60" : "border-slate-200 bg-white"
                        }`}
                        onClick={() => {
                          if (row.kind === "nudge") onOpenNudges?.();
                          if (row.kind === "closure") onOpenClosures?.();
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-lg bg-slate-100 p-2 text-slate-600">
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800">{row.line}</p>
                            {row.createdAt && (
                              <p className="mt-1 text-xs text-slate-500">
                                {new Date(row.createdAt).toLocaleString("en-GB")}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={confirmLogout}
        userName={userName}
        isLoading={logoutMutation.isPending}
      />
      
    </div>
  );
}