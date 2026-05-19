import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Settings, KeyRound, LogOut, HelpCircle, Bell, MessageCircle, Briefcase, Users, CheckCircle, Calendar } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useEmployeeAuth } from "@/contexts/auth-context";
import { SignOutDialog } from "@/components/ui/sign-out-dialog";
import { ProfileSettingsModal } from "@/components/dashboard/modals/profile-settings-modal";
import ChangePasswordModal from "@/components/dashboard/modals/ChangePasswordModal";
import type { UserActivity } from "@shared/schema";

interface AdminTopHeaderProps {
  companyName?: string;
  onHelpClick?: () => void;
  hideHelpButton?: boolean;
  /** Admin only: switches dashboard sidebar to the Nudges session */
  onOpenNudgesTab?: () => void;
}

type AdminNotificationFeed = {
  closures: Array<{ id: string; line: string; createdAt: string | null }>;
  adminNudges: Array<{ id: string; line: string; createdAt: string | null; isUnread: boolean }>;
  clientEscalations: Array<{ id: string; line: string; createdAt: string | null; isUnread: boolean }>;
  unreadAdminNudges: number;
  unreadClientEscalations: number;
};

type EmployeeNotificationItem = {
  id: string;
  line: string;
  createdAt: string | null;
  isUnread: boolean;
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

function getActivityIcon(type: string) {
  switch (type) {
    case 'requirement_added':
      return { icon: Briefcase, bgClass: 'bg-blue-100 dark:bg-blue-900', textClass: 'text-blue-600 dark:text-blue-400' };
    case 'candidate_pipeline_changed':
      return { icon: Users, bgClass: 'bg-purple-100 dark:bg-purple-900', textClass: 'text-purple-600 dark:text-purple-400' };
    case 'closure_made':
      return { icon: CheckCircle, bgClass: 'bg-green-100 dark:bg-green-900', textClass: 'text-green-600 dark:text-green-400' };
    case 'candidate_submitted':
      return { icon: MessageCircle, bgClass: 'bg-orange-100 dark:bg-orange-900', textClass: 'text-orange-600 dark:text-orange-400' };
    case 'interview_scheduled':
      return { icon: Calendar, bgClass: 'bg-cyan-100 dark:bg-cyan-900', textClass: 'text-cyan-600 dark:text-cyan-400' };
    default:
      return { icon: Bell, bgClass: 'bg-gray-100 dark:bg-gray-800', textClass: 'text-gray-600 dark:text-gray-400' };
  }
}

function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default function AdminTopHeader({
  companyName = "Scaling Theory",
  onHelpClick,
  hideHelpButton = false,
  onOpenNudgesTab,
}: AdminTopHeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState<string>('all');
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [profileModalView, setProfileModalView] = useState<"profile" | "settings">("profile");
  const [profileData, setProfileData] = useState<any>(null);
  const { toast } = useToast();
  const { logout } = useAuth();
  const employee = useEmployeeAuth();
  const queryClient = useQueryClient();

  const userRole = employee?.role || "admin";
  const isAdmin = userRole === "admin";
  const isTL = userRole === "team_leader";
  const isTA = userRole === "recruiter" || userRole === "talent_advisor" || userRole === "ta";

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<UserActivity[]>({
    queryKey: ['/api/user-activities', userRole],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/user-activities/${userRole}?limit=5`, {});
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
    enabled: showUserDropdown, // Only fetch when dropdown is open
    refetchInterval: 30000,
  });
  
  useEffect(() => {
    if (showNotifications && (isAdmin || isTL || isTA)) {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/notifications-feed"] });
    }
  }, [showNotifications, isAdmin, isTL, isTA, queryClient]);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!employee?.role) return;

      try {
        let endpoint = '';
        switch (employee.role) {
          case 'recruiter':
            endpoint = '/api/recruiter/profile';
            break;
          case 'team_leader':
            endpoint = '/api/team-leader/profile';
            break;
          case 'admin':
            endpoint = '/api/admin/profile';
            break;
          case 'client':
            endpoint = '/api/client/profile';
            break;
        }

        if (endpoint) {
          try {
            const response = await apiRequest('GET', endpoint);
            const data = await response.json();
            setProfileData(data);
          } catch (error) {
            // Silently fail - profile data is optional
          }
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    loadProfileData();

    const handleProfileUpdated = () => {
      loadProfileData();
    };

    window.addEventListener('profile-updated', handleProfileUpdated);
    return () => window.removeEventListener('profile-updated', handleProfileUpdated);
  }, [employee?.role]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserDropdown && !target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
      if (showNotifications && !target.closest('.notification-panel-container')) {
        setShowNotifications(false);
      }
    };

    if (showUserDropdown || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserDropdown, showNotifications]);
  
  const userName = profileData?.name || employee?.name || "Admin User";
  const userEmail = profileData?.email || employee?.email || "";
  const displayCompanyName = companyName;
  
  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'team_leader':
        return 'Team Leader';
      case 'recruiter':
        return 'Recruiter';
      case 'client':
        return 'Client';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
    }
  };
  
  const displayRole = getRoleDisplayName(userRole);

  const {
    data: employeeFeed,
    isLoading: feedLoading,
    isError: feedError,
    refetch: refetchNotificationFeed,
  } = useQuery<EmployeeNotificationFeed>({
    queryKey: ["/api/employee/notifications-feed"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/employee/notifications-feed", {});
      return res.json();
    },
    enabled: isAdmin || isTL || isTA,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const markNudgeReadMutation = useMutation({
    mutationFn: async (nudgeId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/notifications/nudges/${nudgeId}/read`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee/notifications-feed"] });
    },
  });

  const notificationTabs = useMemo(() => {
    if (isAdmin) {
      return [
        { id: "all", label: "All" },
        { id: "closures", label: "Closures" },
        { id: "nudges", label: "Nudges" },
        { id: "escalations", label: "Escalations" },
      ];
    }
    if (isTL) {
      return [
        { id: "all", label: "All" },
        { id: "newRequirements", label: "New Requirements" },
        { id: "nudges", label: "Nudges" },
        { id: "escalatedNudges", label: "Escalated Nudges" },
        { id: "closures", label: "Closures" },
      ];
    }
    return [
      { id: "all", label: "All" },
      { id: "newRequirements", label: "New Requirements" },
      { id: "nudges", label: "Nudges" },
      { id: "escalatedNudges", label: "Escalated Nudges" },
      { id: "closures", label: "Closures" },
      { id: "newCandidateApplied", label: "New Candidate Applied" },
    ];
  }, [isAdmin, isTL]);

  useEffect(() => {
    if (!notificationTabs.some((t) => t.id === notificationTab)) {
      setNotificationTab(notificationTabs[0]?.id || "all");
    }
  }, [notificationTabs, notificationTab]);

  type FeedRow = EmployeeNotificationItem & { key: string; kind: string; nudgeId?: string; sort: number };

  const mergedRows = useMemo<FeedRow[]>(() => {
    if (!employeeFeed) return [];
    const rows: FeedRow[] = [];

    const pushRows = (kind: string, items: EmployeeNotificationItem[], includeNudgeId = false) => {
      for (const item of items) {
        rows.push({
          key: `${kind}-${item.id}`,
          kind,
          line: item.line,
          createdAt: item.createdAt,
          isUnread: item.isUnread,
          nudgeId: includeNudgeId ? item.id : undefined,
          sort: item.createdAt ? new Date(item.createdAt).getTime() : 0,
          id: item.id,
        });
      }
    };

    if (isAdmin) {
      pushRows("closure", employeeFeed.closures);
      pushRows("nudge", employeeFeed.nudges, true);
      pushRows("escalation", employeeFeed.escalatedNudges);
    } else if (isTL) {
      pushRows("newRequirement", employeeFeed.newRequirements);
      pushRows("nudge", employeeFeed.nudges);
      pushRows("escalatedNudge", employeeFeed.escalatedNudges);
      pushRows("closure", employeeFeed.closures);
    } else {
      pushRows("newRequirement", employeeFeed.newRequirements);
      pushRows("nudge", employeeFeed.nudges);
      pushRows("escalatedNudge", employeeFeed.escalatedNudges);
      pushRows("closure", employeeFeed.closures);
      pushRows("newCandidate", employeeFeed.newCandidateApplied);
    }
    return rows.sort((a, b) => b.sort - a.sort);
  }, [employeeFeed, isAdmin, isTL]);

  const filteredRows = useMemo(() => {
    if (notificationTab === "all") return mergedRows;
    if (notificationTab === "closures") return mergedRows.filter((r) => r.kind === "closure");
    if (notificationTab === "nudges") return mergedRows.filter((r) => r.kind === "nudge");
    if (notificationTab === "escalations") return mergedRows.filter((r) => r.kind === "escalation");
    if (notificationTab === "newRequirements") return mergedRows.filter((r) => r.kind === "newRequirement");
    if (notificationTab === "escalatedNudges") return mergedRows.filter((r) => r.kind === "escalatedNudge");
    if (notificationTab === "newCandidateApplied") return mergedRows.filter((r) => r.kind === "newCandidate");
    return mergedRows;
  }, [mergedRows, notificationTab]);

  const headerUnreadCount = useMemo(() => {
    const fromRows = mergedRows.filter((r) => r.isUnread).length;
    const fromFeed = employeeFeed?.unreadCount ?? 0;
    return Math.max(fromFeed, fromRows);
  }, [mergedRows, employeeFeed]);

  const openNudgesAndClose = async (opts?: { markNudgeReadId?: string }) => {
    if (opts?.markNudgeReadId) {
      try {
        await markNudgeReadMutation.mutateAsync(opts.markNudgeReadId);
      } catch {
        /* still navigate */
      }
    }
    setShowNotifications(false);
    sessionStorage.setItem("adminDashboardSidebarTab", "nudges");
    void queryClient.invalidateQueries({ queryKey: ["/api/nudges"] });
    onOpenNudgesTab?.();
  };
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/employee-logout', {});
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
      window.location.href = '/';
    },
    onError: (error: any) => {
      logout();
      // Clear any stored session data
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
    setShowUserDropdown(false);
    setShowSignOutDialog(true);
  };

  const confirmLogout = () => {
    logoutMutation.mutate();
    setShowSignOutDialog(false);
  };

  const handleProfileSettings = () => {
    setShowUserDropdown(false);
    setProfileModalView("profile");
    setShowProfileSettings(true);
  };

  const handlePasswordChange = () => {
    setShowUserDropdown(false);
    setIsChangePasswordModalOpen(true);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 z-30 sticky top-0">
      <div className="flex items-center min-w-0">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate pl-2">
          {companyName}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {!hideHelpButton && (
          <button 
            onClick={onHelpClick}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            data-testid="button-header-help"
          >
            <HelpCircle size={16} />
            <span className="text-sm">Help</span>
          </button>
        )}

        {(isAdmin || isTL || isTA) && (
          <div className="relative notification-panel-container">
            <button
              type="button"
              onClick={() => {
                setShowUserDropdown(false);
                setShowNotifications((prev) => !prev);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Notifications"
              data-testid="button-header-notification"
            >
              <Bell size={20} strokeWidth={2} />
              {headerUnreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" />
              )}
            </button>

            {showNotifications && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[1px]"
                  aria-label="Close notifications"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="notification-panel-container fixed right-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-[min(96vw,720px)] flex-col rounded-l-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-900">
                  <div className="border-b border-slate-100 px-5 pb-3 pt-4 dark:border-slate-800">
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      Notifications
                    </h3>
                    <div className="mt-3 overflow-x-auto">
                      <div className="flex w-max min-w-full rounded-xl bg-slate-100/90 p-1 dark:bg-slate-800/80">
                        {notificationTabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setNotificationTab(tab.id)}
                          className={`relative shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition ${
                            notificationTab === tab.id
                              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50"
                              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                          }`}
                        >
                          <span>{tab.label}</span>
                        </button>
                      ))}
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                    {feedLoading && (
                      <p className="px-3 py-8 text-center text-sm text-slate-500">Loading…</p>
                    )}
                    {feedError && !feedLoading && !employeeFeed && (
                      <div className="px-3 py-6 text-center">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Notifications could not be loaded.
                        </p>
                        <button
                          type="button"
                          onClick={() => void refetchNotificationFeed()}
                          className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400"
                        >
                          Try again
                        </button>
                      </div>
                    )}
                    {feedError && !feedLoading && employeeFeed && filteredRows.length > 0 && (
                      <p className="mx-3 mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        Showing last loaded notifications. Pull to refresh if something looks out of date.
                      </p>
                    )}
                    {!feedLoading && (!feedError || employeeFeed) && filteredRows.length === 0 && (
                      <p className="px-3 py-8 text-center text-sm text-slate-500">No notifications yet.</p>
                    )}
                    {!feedLoading &&
                      (!feedError || !!employeeFeed) &&
                      filteredRows.map((row) => {
                        const initials = row.line.replace(/^\[/, "").charAt(0).toUpperCase() || "?";
                        const sub =
                          row.kind === "newRequirement"
                            ? "New requirement"
                            : row.kind === "newCandidate"
                              ? "New candidate applied"
                              : row.kind === "closure"
                            ? "New closure"
                            : row.kind === "escalation"
                              ? "Escalated to client"
                              : row.kind === "escalatedNudge"
                                ? "Escalated nudge"
                                : "Nudge notification";
                        return (
                          <div
                            key={row.key}
                            className={`group relative mb-1 flex items-stretch gap-3 rounded-2xl px-3 py-3 pr-2 transition ${
                              row.isUnread
                                ? "bg-violet-50/80 dark:bg-violet-950/30"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-semibold text-white">
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
                                {row.line}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                              {row.createdAt && (
                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                  {getRelativeTime(row.createdAt)}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-row items-center gap-2 self-center">
                              {isAdmin && row.kind === "nudge" && row.nudgeId && (
                                <button
                                  type="button"
                                  onClick={() => void openNudgesAndClose({ markNudgeReadId: row.nudgeId })}
                                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60"
                                  disabled={markNudgeReadMutation.isPending}
                                >
                                  Act
                                </button>
                              )}
                              {row.isUnread && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-violet-600" aria-hidden />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                </div>
              </>
            )}
          </div>
        )}

        <div className="relative user-dropdown-container">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            data-testid="button-user-dropdown"
          >
            {profileData?.profilePicture ? (
              <img
                src={profileData.profilePicture}
                alt={userName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </div>
            )}
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium" data-testid="text-profile-name">{userName}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400" data-testid="text-profile-role">{displayRole}</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} 
            />
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 top-full mt-3 w-72 rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.18)] z-50"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                {profileData?.profilePicture ? (
                  <img
                    src={profileData.profilePicture}
                    alt={userName}
                    className="h-11 w-11 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-base font-semibold">
                    {userName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{userName}</p>
                  <p className="truncate text-xs text-slate-500">{displayRole}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={handleProfileSettings}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  data-testid="button-profile-settings"
                >
                  <Settings size={17} />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={handlePasswordChange}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  data-testid="button-change-password"
                >
                  <KeyRound size={17} />
                  <span>Change Password</span>
                </button>

                {(isAdmin || isTL || isTA) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowNotifications(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Bell size={17} />
                    <span>Notifications</span>
                  </button>
                )}

                <div className="my-2 border-t border-slate-200" />

                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                  data-testid="button-admin-header-logout"
                >
                  <LogOut size={17} />
                  <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <SignOutDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={confirmLogout}
        userName={userName}
        isLoading={logoutMutation.isPending}
      />
      
      <ProfileSettingsModal
        open={showProfileSettings}
        onOpenChange={setShowProfileSettings}
        initialView={profileModalView}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </header>
  );
}
