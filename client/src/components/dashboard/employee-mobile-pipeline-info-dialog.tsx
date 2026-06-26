import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";

type EmployeeMobilePipelineInfoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function getEmployeeMobilePipelineInfoSeenKey(employeeId?: string | null): string | null {
  return employeeId ? `staffos-employee-mobile-pipeline-info-seen:${employeeId}` : null;
}

export function EmployeeMobilePipelineInfoDialog({
  open,
  onOpenChange,
}: EmployeeMobilePipelineInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-sm gap-0 overflow-hidden rounded-2xl border border-slate-200 p-0 shadow-xl">
        <DialogHeader className="space-y-2 border-b border-slate-100 bg-slate-50 px-4 py-4 text-left">
          <DialogTitle className="text-base font-semibold text-slate-900">
            Mobile pipeline view
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-slate-600">
            You are using StaffOS on a small screen. Some workspace features are simplified here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-4 py-4 text-xs leading-relaxed text-slate-600">
          <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/80 p-3">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <p>
              On mobile, only the <span className="font-semibold text-slate-800">Pipeline</span> session is
              available — track candidates, open comment sessions, and use notifications from the header.
            </p>
          </div>
          <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <p>
              For the full dashboard — requirements, performance, reports, team views, and more — open
              StaffOS on a <span className="font-semibold text-slate-800">desktop or wider screen</span>.
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-100 px-4 py-3 sm:justify-stretch">
          <Button
            type="button"
            className="h-9 w-full rounded-lg bg-blue-600 text-xs font-medium hover:bg-blue-700"
            onClick={() => onOpenChange(false)}
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
