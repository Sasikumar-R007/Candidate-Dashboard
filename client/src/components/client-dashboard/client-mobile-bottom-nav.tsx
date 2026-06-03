import { type LucideIcon } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

interface ClientMobileBottomNavProps {
  activeTab: string;
  items: NavItem[];
  onTabChange: (tab: string) => void;
}

export function ClientMobileBottomNav({
  activeTab,
  items,
  onTabChange,
}: ClientMobileBottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[120] border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur-md md:hidden"
      aria-label="Client mobile navigation"
    >
      <div className="mx-auto flex h-16 max-w-xl items-stretch overflow-x-auto scrollbar-hide">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative flex min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                isActive ? "text-cyan-600" : "text-slate-500 active:text-slate-800"
              }`}
              data-testid={`button-client-mobile-nav-${item.id}`}
            >
              {isActive && (
                <span className="absolute left-2 right-2 top-0 h-0.5 rounded-full bg-cyan-500" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.25 : 2} />
              <span className={`max-w-[4.5rem] truncate text-[10px] leading-tight ${isActive ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
