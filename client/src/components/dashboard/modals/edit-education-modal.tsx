import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Education Information</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="highestQualification">Highest Qualification</Label>
            <Input
              id="highestQualification"
              value={formData.highestQualification}
              onChange={(e) => handleInputChange('highestQualification', e.target.value)}
              placeholder="Bachelor's, Master's, PhD, etc."
            />
          </div>

          <div>
            <Label htmlFor="collegeName">College Name</Label>
            <Input
              id="collegeName"
              value={formData.collegeName}
              onChange={(e) => handleInputChange('collegeName', e.target.value)}
              placeholder="Your college/university name"
            />
          </div>

          <div>
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              placeholder="React, Node.js, Python, etc."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 text-white hover:bg-blue-700 rounded"
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