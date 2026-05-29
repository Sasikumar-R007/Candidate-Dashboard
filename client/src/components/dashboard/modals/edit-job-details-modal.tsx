import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
    totalExperience: profile.totalExperience || '',
  });

  const updateJobDetailsMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('PATCH', '/api/profile', data);
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
      <DialogContent className="max-w-2xl rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 px-8 py-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Your Journey</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Configure your career preferences such as notice period and domain expertise.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-gray-800 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
              {/* <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Pedigree Level
              </label> */}
              <Select 
                value={formData.pedigreeLevel} 
                onValueChange={(value) => handleInputChange('pedigreeLevel', value)}
              >
                <SelectTrigger className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
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

            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Notice Period
              </label>
              <Input
                id="noticePeriod"
                value={formData.noticePeriod}
                onChange={(e) => handleInputChange('noticePeriod', e.target.value)}
                placeholder="30 days, 60 days, etc."
                className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
            </div>

            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Current Company
              </label>
              <Input
                id="currentCompany"
                value={formData.currentCompany}
                onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                placeholder="Your current company"
                className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
            </div>

            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Current Role
              </label>
              <Input
                id="currentRole"
                value={formData.currentRole}
                onChange={(e) => handleInputChange('currentRole', e.target.value)}
                placeholder="Software Engineer, Product Manager, etc."
                className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
            </div>

            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Current Domain
              </label>
              <Input
                id="currentDomain"
                value={formData.currentDomain}
                onChange={(e) => handleInputChange('currentDomain', e.target.value)}
                placeholder="Technology, Finance, Healthcare, etc."
                className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
            </div>

            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Company Level
              </label>
              <Input
                id="companyLevel"
                value={formData.companyLevel}
                onChange={(e) => handleInputChange('companyLevel', e.target.value)}
                placeholder="Startup, Mid-size, Enterprise"
                className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
            </div>

            <div className="relative group">
              <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
                Total Experience
              </label>
              <Input
                id="totalExperience"
                value={formData.totalExperience}
                onChange={(e) => handleInputChange('totalExperience', e.target.value)}
                placeholder="e.g. 5+ Years"
                className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="relative group">
            <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
              Product/Service
            </label>
            <Select 
              value={formData.productService} 
              onValueChange={(value) => handleInputChange('productService', value)}
            >
              <SelectTrigger className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                <SelectValue placeholder="Select product/service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Service">Service Based</SelectItem>
                <SelectItem value="Product Based">Product Based</SelectItem>
                <SelectItem value="Service & Product Based">Service & Product Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-6 h-12 font-semibold border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-10 h-12 font-medium shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
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
