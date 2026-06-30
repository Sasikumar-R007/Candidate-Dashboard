import { APP_VERSION_LABEL } from "@shared/app-version";

interface AppVersionBadgeProps {
  className?: string;
  prefix?: string;
}

export function AppVersionBadge({ className = "", prefix = "StaffOS" }: AppVersionBadgeProps) {
  return (
    <div className={`flex items-center justify-between text-xs text-slate-500 ${className}`}>
      <span>{prefix} release</span>
      <span className="font-mono text-slate-700">{APP_VERSION_LABEL}</span>
    </div>
  );
}
