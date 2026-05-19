import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

type TeamPayload = {
  members: Array<{
    id: string;
    name: string;
    email: string;
    employeeId: string | null;
    isActive: boolean;
    departmentName: string | null;
  }>;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requirementId: string | null;
  requirementTitle?: string;
  currentMemberId?: string | null;
};

export function ClientRequirementAssignModal({
  open,
  onOpenChange,
  requirementId,
  requirementTitle,
  currentMemberId,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [memberId, setMemberId] = useState<string>("__none__");

  const { data: team } = useQuery<TeamPayload>({
    queryKey: ["/api/client/team"],
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setMemberId(currentMemberId || "__none__");
    }
  }, [open, currentMemberId]);

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!requirementId) return;
      const res = await apiRequest(
        "PATCH",
        `/api/client/team/requirements/${requirementId}/assign`,
        { memberId: memberId === "__none__" ? null : memberId },
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to assign member");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client/team"] });
      queryClient.invalidateQueries({ queryKey: ["/api/client/requirements"] });
      toast({ title: "Assignment saved" });
      onOpenChange(false);
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const activeMembers = (team?.members || []).filter((m) => m.isActive);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign team member</DialogTitle>
          <DialogDescription>
            {requirementTitle
              ? `Choose who owns "${requirementTitle}" (one member per requirement).`
              : "Choose one member for this requirement."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Select value={memberId} onValueChange={setMemberId}>
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Unassigned</SelectItem>
              {activeMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                  {m.departmentName ? ` · ${m.departmentName}` : ""}
                  {m.employeeId ? ` (${m.employeeId})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeMembers.length === 0 && (
            <p className="mt-3 text-sm text-amber-700">
              No active members yet. Add a member from the Team tab first.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!requirementId || assignMutation.isPending}
            onClick={() => assignMutation.mutate()}
          >
            {assignMutation.isPending ? "Saving…" : "Save assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
