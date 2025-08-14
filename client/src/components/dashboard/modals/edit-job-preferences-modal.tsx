import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

interface EditJobPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditJobPreferencesModal({
  open,
  onOpenChange
}: EditJobPreferencesModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    defaultValues: {
      jobTypes: 'Full-time, Remote',
      salaryRange: '$80,000 - $120,000',
      preferredLocations: 'Remote, San Francisco, New York',
      availabilityDate: '2024-09-01',
      instructions: 'Looking for remote opportunities in tech companies with good work-life balance and growth opportunities.',
    }
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Job preferences updated:', data);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update job preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl h-auto min-h-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Preferences</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="jobTypes">Job Types</Label>
            <Input
              id="jobTypes"
              {...form.register('jobTypes')}
              placeholder="Full-time, Part-time, Contract"
              className="bg-gray-50 rounded border border-gray-200"
            />
          </div>
          
          <div>
            <Label htmlFor="salaryRange">Salary Range</Label>
            <Input
              id="salaryRange"
              {...form.register('salaryRange')}
              placeholder="$60,000 - $100,000"
              className="bg-gray-50 rounded border border-gray-200"
            />
          </div>
          
          <div>
            <Label htmlFor="preferredLocations">Preferred Locations</Label>
            <Input
              id="preferredLocations"
              {...form.register('preferredLocations')}
              placeholder="Remote, New York, San Francisco"
              className="bg-gray-50 rounded border border-gray-200"
            />
          </div>
          
          <div>
            <Label htmlFor="availabilityDate">Availability Date</Label>
            <Input
              id="availabilityDate"
              type="date"
              {...form.register('availabilityDate')}
              className="bg-gray-50 rounded border border-gray-200"
            />
          </div>
          
          <div>
            <Label htmlFor="instructions">Instructions to Recruiter</Label>
            <Textarea
              id="instructions"
              {...form.register('instructions')}
              rows={4}
              placeholder="Additional information for recruiters..."
              className="bg-gray-50 rounded border border-gray-200"
            />
          </div>
          
          <div className="flex gap-3 justify-end">
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
              className="bg-secondary-blue hover:bg-blue-600 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}