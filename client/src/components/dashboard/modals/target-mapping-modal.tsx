import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Employee } from "@shared/schema";

interface TargetMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TargetMappingModal({ isOpen, onClose }: TargetMappingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [teamLeadId, setTeamLeadId] = useState("");
  const [teamMemberId, setTeamMemberId] = useState("");
  const [quarter, setQuarter] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [minimumTarget, setMinimumTarget] = useState("");

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/admin/employees"],
  });

  const teamLeaders = employees.filter(emp => emp.role === "team_leader");
  const teamMembers = employees.filter(emp => emp.role === "recruiter" || emp.role === "talent_advisor");

  const createTargetMappingMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/admin/target-mappings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Target mapping created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/target-mappings"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create target mapping",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!teamLeadId || !teamMemberId || !quarter || !year || !minimumTarget) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedTL = teamLeaders.find(tl => tl.id === teamLeadId);
    const selectedMember = teamMembers.find(tm => tm.id === teamMemberId);

    if (!selectedTL || !selectedMember) {
      toast({
        title: "Error",
        description: "Invalid team leader or team member selection",
        variant: "destructive",
      });
      return;
    }

    createTargetMappingMutation.mutate({
      teamLeadId: selectedTL.id,
      teamMemberId: selectedMember.id,
      quarter,
      year,
      minimumTarget,
    });
  };

  const handleClose = () => {
    setTeamLeadId("");
    setTeamMemberId("");
    setQuarter("");
    setYear(new Date().getFullYear().toString());
    setMinimumTarget("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between gap-2 p-4 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Target Mapping
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1"
            data-testid="button-close-target-mapping"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Team Lead *</Label>
              <Select value={teamLeadId} onValueChange={setTeamLeadId}>
                <SelectTrigger className="w-full" data-testid="select-team-lead">
                  <SelectValue placeholder="Select Team Lead" />
                </SelectTrigger>
                <SelectContent>
                  {teamLeaders.map((tl) => (
                    <SelectItem key={tl.id} value={tl.id}>
                      {tl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Team Member *</Label>
              <Select value={teamMemberId} onValueChange={setTeamMemberId}>
                <SelectTrigger className="w-full" data-testid="select-team-member">
                  <SelectValue placeholder="Select Team Member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Quarter *</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger className="w-full" data-testid="select-quarter">
                  <SelectValue placeholder="Select Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                  <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                  <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                  <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Year *</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                data-testid="input-year"
              />
            </div>

            <div>
              <Label className="text-sm text-gray-700 dark:text-gray-300 mb-2 block">Minimum Target (₹) *</Label>
              <Input
                type="text"
                value={minimumTarget}
                onChange={(e) => setMinimumTarget(e.target.value)}
                placeholder="15,00,000"
                data-testid="input-minimum-target"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              className="w-full"
              onClick={handleSubmit}
              disabled={createTargetMappingMutation.isPending}
              data-testid="button-submit-target-mapping"
            >
              {createTargetMappingMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}