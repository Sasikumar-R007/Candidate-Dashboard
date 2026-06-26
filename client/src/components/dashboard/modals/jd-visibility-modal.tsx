import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type JdVisibilityMeta = {
  showToCandidate: boolean;
  updatedByRole?: string | null;
  updatedByName?: string | null;
  updatedAt?: string | null;
};

type JdVisibilityModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirementLabel?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  onSave: () => void;
  isSaving?: boolean;
  audit?: JdVisibilityMeta | null;
};

function formatAuditLabel(audit?: JdVisibilityMeta | null): string {
  if (!audit?.updatedAt) return "Not updated yet";
  const stamp = new Date(audit.updatedAt);
  const timeLabel = Number.isNaN(stamp.getTime())
    ? audit.updatedAt
    : stamp.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  const byRole = audit.updatedByRole || "Unknown role";
  const byName = audit.updatedByName?.trim() ? ` (${audit.updatedByName.trim()})` : "";
  return `${byRole}${byName} on ${timeLabel}`;
}

export function JdVisibilityModal({
  open,
  onOpenChange,
  requirementLabel,
  value,
  onValueChange,
  onSave,
  isSaving = false,
  audit,
}: JdVisibilityModalProps) {
  const statusText = value ? "Show to Candidate" : "Don't Show to Candidate";
  const statusTone = value
    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
    : "text-amber-700 bg-amber-50 border-amber-200";
  const auditLabel = useMemo(() => formatAuditLabel(audit), [audit]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>JD Visibility</DialogTitle>
          <DialogDescription>
            Control whether JD document content should be visible to candidates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Requirement: <span className="font-semibold">{requirementLabel || "N/A"}</span>
          </div>

          <div className={`rounded-md border px-3 py-2 text-sm font-medium ${statusTone}`}>
            Current selection: {statusText}
          </div>

          <div className="flex items-center justify-between rounded-md border border-slate-200 p-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Show JD to candidate</p>
              <p className="text-xs text-slate-500">
                Turn off to hide JD document/text but keep other role details visible.
              </p>
            </div>
            <Switch
              checked={value}
              onCheckedChange={onValueChange}
              className="data-[state=checked]:bg-blue-600"
              disabled={isSaving}
            />
          </div>

          <div className="rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-600">
            Last edited by: <span className="font-medium">{auditLabel}</span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
