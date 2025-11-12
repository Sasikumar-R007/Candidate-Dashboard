import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
      return await apiRequest("POST", "/api/admin/target-mappings", data);
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
      year: parseInt(year, 10),
      minimumTarget: parseInt(minimumTarget.replace(/,/g, ''), 10),
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
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Target Mapping
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div>
              <Select value={teamLeadId} onValueChange={setTeamLeadId}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800" data-testid="select-team-lead">
                  <SelectValue placeholder="Team Lead *" className="text-gray-400" />
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
              <Select value={teamMemberId} onValueChange={setTeamMemberId}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800" data-testid="select-team-member">
                  <SelectValue placeholder="Team Member *" className="text-gray-400" />
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
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-800" data-testid="select-quarter">
                  <SelectValue placeholder="Quarter *" className="text-gray-400" />
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
              <Input
                type="number"
                className="bg-gray-50 dark:bg-gray-800"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year * (e.g., 2025)"
                data-testid="input-year"
              />
            </div>

            <div>
              <Input
                type="text"
                className="bg-gray-50 dark:bg-gray-800"
                value={minimumTarget}
                onChange={(e) => setMinimumTarget(e.target.value)}
                placeholder="Minimum Target (₹) * (e.g., 15,00,000)"
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