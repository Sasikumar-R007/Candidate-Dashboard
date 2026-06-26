import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const STAFFOS_V2_AVAILABLE_MESSAGE = "Available in StaffOS Version 2.0";

type StaffOsV2DisabledSectionProps = {
  children: ReactNode;
  className?: string;
};

export function StaffOsV2DisabledSection({ children, className }: StaffOsV2DisabledSectionProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn("relative cursor-not-allowed", className)}
            aria-disabled="true"
            data-staffos-v2-disabled="true"
          >
            <div className="pointer-events-none select-none opacity-50 grayscale">{children}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-center">
          {STAFFOS_V2_AVAILABLE_MESSAGE}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
