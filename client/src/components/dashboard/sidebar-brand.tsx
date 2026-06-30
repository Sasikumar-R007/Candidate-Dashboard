import staffosLogo from "@/assets/staffos logo 2.png";
import { APP_VERSION_LABEL } from "@shared/app-version";

interface SidebarBrandProps {
  expanded: boolean;
  title?: string;
}

export function SidebarBrand({ expanded, title = "StaffOS" }: SidebarBrandProps) {
  return (
    <div
      className={`flex h-16 shrink-0 items-center gap-3 overflow-hidden border-b border-slate-700 ${
        expanded ? "px-4" : "justify-center px-0"
      }`}
    >
      <img
        src={staffosLogo}
        alt="StaffOS Logo"
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
      <div
        className={`min-w-0 overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out ${
          expanded ? "max-w-[11rem] opacity-100" : "max-w-0 opacity-0"
        }`}
        aria-hidden={!expanded}
      >
        <span className="block whitespace-nowrap text-lg font-bold leading-tight">{title}</span>
        <span className="block pl-0.5 text-[10px] font-normal tracking-wide text-slate-400">
          {APP_VERSION_LABEL}
        </span>
      </div>
    </div>
  );
}
