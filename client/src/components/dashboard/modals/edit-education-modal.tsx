import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Profile } from '@shared/schema';

interface EditEducationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export default function EditEducationModal({ 
  open, 
  onOpenChange, 
  profile 
}: EditEducationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    highestQualification: profile.highestQualification || '',
    collegeName: profile.collegeName || '',
    skills: profile.skills || '',
  });

  const updateEducationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update education information');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      onOpenChange(false);
      toast({ title: 'Education information updated successfully!' });
    },
    onError: () => {
      toast({ 
        title: 'Error updating education information', 
        variant: 'destructive' 
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEducationMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-2xl p-0 overflow-hidden">
        <div className="bg-blue-50/50 dark:bg-blue-900/10 px-8 py-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Education Details</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Update your academic qualifications and core skills for recruitment tracking.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-gray-800">
          <div className="relative group">
            <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
              Highest Qualification
            </label>
            <Input
              id="highestQualification"
              value={formData.highestQualification}
              onChange={(e) => handleInputChange('highestQualification', e.target.value)}
              placeholder="Bachelor's, Master's, PhD, etc."
              className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          <div className="relative group">
            <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
              College Name
            </label>
            <Input
              id="collegeName"
              value={formData.collegeName}
              onChange={(e) => handleInputChange('collegeName', e.target.value)}
              placeholder="Your college/university name"
              className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          <div className="relative group">
            <label className="absolute -top-2 left-3 bg-white dark:bg-gray-800 px-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest z-10 group-focus-within:text-blue-500 transition-colors">
              Skills
            </label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              placeholder="React, Node.js, Python, etc."
              className="h-12 border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-6 h-12 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-10 h-12 font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.02]"
              disabled={updateEducationMutation.isPending || (
                formData.highestQualification === (profile.highestQualification || '') &&
                formData.collegeName === (profile.collegeName || '') &&
                formData.skills === (profile.skills || '')
              )}
            >
              {updateEducationMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}