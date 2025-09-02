import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "@/hooks/use-toast";

interface AddRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddRequirementModal({ isOpen, onClose }: AddRequirementModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    position: '',
    criticality: '',
    company: '',
    spoc: '',
    talentAdvisor: '',
    teamLead: ''
  });

  // Get team leads for dropdown
  const teamLeads = ["Arun", "Anusha"];
  const talentAdvisors = ["Mel Gibson", "Robert Kim", "David Wilson", "Kevin Brown", "Tom Anderson"];

  const createRequirementMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/admin/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          createdAt: new Date().toISOString()
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create requirement');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'requirements'] });
      toast({
        title: "Success",
        description: "Requirement added successfully!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add requirement. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.position || !formData.criticality || !formData.company || !formData.spoc) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createRequirementMutation.mutate(formData);
  };

  const handleClose = () => {
    setFormData({
      position: '',
      criticality: '',
      company: '',
      spoc: '',
      talentAdvisor: '',
      teamLead: ''
    });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="modal-add-requirement">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Requirement
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Position *
              </Label>
              <Input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="input-styled"
                required
                data-testid="input-position"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="criticality" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Criticality *
              </Label>
              <Select 
                value={formData.criticality} 
                onValueChange={(value) => handleInputChange('criticality', value)}
                required
              >
                <SelectTrigger className="input-styled" data-testid="select-criticality">
                  <SelectValue placeholder="Select criticality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="LOW">LOW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Company *
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g. TechCorp"
                className="input-styled"
                required
                data-testid="input-company"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spoc" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                SPOC *
              </Label>
              <Input
                id="spoc"
                type="text"
                value={formData.spoc}
                onChange={(e) => handleInputChange('spoc', e.target.value)}
                placeholder="e.g. John Doe"
                className="input-styled"
                required
                data-testid="input-spoc"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamLead" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Lead
            </Label>
            <Select 
              value={formData.teamLead} 
              onValueChange={(value) => handleInputChange('teamLead', value)}
            >
              <SelectTrigger className="input-styled" data-testid="select-team-lead">
                <SelectValue placeholder="Select team lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unassigned">Unassigned</SelectItem>
                {teamLeads.map(lead => (
                  <SelectItem key={lead} value={lead}>{lead}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6 py-2 rounded"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createRequirementMutation.isPending}
              className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium px-6 py-2 rounded"
              data-testid="button-add-requirement"
            >
              {createRequirementMutation.isPending ? 'Adding...' : 'Add Requirement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}