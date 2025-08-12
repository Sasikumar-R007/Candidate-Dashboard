import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Profile } from '@shared/schema';

interface EditJobDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export default function EditJobDetailsModal({ 
  open, 
  onOpenChange, 
  profile 
}: EditJobDetailsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    pedigreeLevel: profile.pedigreeLevel || '',
    noticePeriod: profile.noticePeriod || '',
    currentCompany: profile.currentCompany || '',
    currentRole: profile.currentRole || '',
    currentDomain: profile.currentDomain || '',
    companyLevel: profile.companyLevel || '',
    productService: profile.productService || '',
  });

  const updateJobDetailsMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update job details');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      onOpenChange(false);
      toast({ title: 'Job details updated successfully!' });
    },
    onError: () => {
      toast({ 
        title: 'Error updating job details', 
        variant: 'destructive' 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateJobDetailsMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Details</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pedigreeLevel">Pedigree Level</Label>
              <Select 
                value={formData.pedigreeLevel} 
                onValueChange={(value) => handleInputChange('pedigreeLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pedigree level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tier 1 Institution">Tier 1 Institution</SelectItem>
                  <SelectItem value="Tier 2 Institution">Tier 2 Institution</SelectItem>
                  <SelectItem value="Tier 3 Institution">Tier 3 Institution</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="noticePeriod">Notice Period</Label>
              <Input
                id="noticePeriod"
                value={formData.noticePeriod}
                onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                placeholder="30 days, 60 days, etc."
              />
            </div>

            <div>
              <Label htmlFor="currentCompany">Current Company</Label>
              <Input
                id="currentCompany"
                value={formData.currentCompany}
                onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                placeholder="Your current company"
              />
            </div>

            <div>
              <Label htmlFor="currentRole">Current Role</Label>
              <Input
                id="currentRole"
                value={formData.currentRole}
                onChange={(e) => handleInputChange('currentRole', e.target.value)}
                placeholder="Software Engineer, Product Manager, etc."
              />
            </div>

            <div>
              <Label htmlFor="currentDomain">Current Domain</Label>
              <Input
                id="currentDomain"
                value={formData.currentDomain}
                onChange={(e) => handleInputChange('currentDomain', e.target.value)}
                placeholder="Technology, Finance, Healthcare, etc."
              />
            </div>

            <div>
              <Label htmlFor="companyLevel">Company Level</Label>
              <Input
                id="companyLevel"
                value={formData.companyLevel}
                onChange={(e) => handleInputChange('companyLevel', e.target.value)}
                placeholder="Startup, Mid-size, Enterprise"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="productService">Product/Service</Label>
            <Select 
              value={formData.productService} 
              onValueChange={(value) => handleInputChange('productService', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product/service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Product-Based">Product-Based</SelectItem>
                <SelectItem value="Service-Based">Service-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={updateJobDetailsMutation.isPending}
            >
              {updateJobDetailsMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}