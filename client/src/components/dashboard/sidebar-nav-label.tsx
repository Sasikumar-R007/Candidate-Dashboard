import type { ReactNode } from "react";

interface SidebarNavLabelProps {
  expanded: boolean;
  children: ReactNode;
}

export function SidebarNavLabel({ expanded, children }: SidebarNavLabelProps) {
  return (
    <span
      className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-[max-width,opacity] duration-300 ease-in-out ${
        expanded ? "max-w-[12rem] opacity-100" : "max-w-0 opacity-0"
      }`}
      aria-hidden={!expanded}
    >
      {children}
    </span>
  );
}
