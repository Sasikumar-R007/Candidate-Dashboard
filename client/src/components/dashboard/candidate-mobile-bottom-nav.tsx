import { Briefcase, LayoutGrid, Settings, UserCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCandidateAuth } from "@/contexts/auth-context";

interface CandidateMobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "my-jobs", label: "My Jobs", icon: LayoutGrid },
  { id: "edit-view", label: "Profile", icon: UserCircle },
  { id: "job-board", label: "Jobs", icon: Briefcase },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export default function CandidateMobileBottomNav({
  activeTab,
  onTabChange,
}: CandidateMobileBottomNavProps) {
  const candidate = useCandidateAuth();

  const { data: candidateNudges = [] } = useQuery<any[]>({
    queryKey: ["/api/candidate/nudges"],
    enabled: !!candidate,
  });

  const hasUnreadNudges = candidateNudges.some(
    (n) => (n.isResponded || n.message) && !n.isRead,
  );

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[120] border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                isActive
                  ? "text-cyan-600"
                  : "text-slate-500 active:text-slate-800"
              }`}
              data-testid={`button-mobile-nav-${item.id}`}
            >
              {isActive && (
                <span className="absolute top-0 left-3 right-3 h-0.5 rounded-full bg-cyan-500" />
              )}
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.25 : 2}
                  className={isActive ? "text-cyan-600" : undefined}
                />
                {item.id === "my-jobs" && hasUnreadNudges && (
                  <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium leading-tight ${
                  isActive ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
