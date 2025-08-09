import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useUpdateProfile } from '@/hooks/use-profile';
import type { Profile } from '@shared/schema';

interface EditAboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export default function EditAboutModal({
  open,
  onOpenChange,
  profile
}: EditAboutModalProps) {
  const updateProfile = useUpdateProfile();
  
  const form = useForm({
    defaultValues: {
      aboutSummary: profile.aboutSummary || '',
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await updateProfile.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update about section:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit About</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="aboutSummary">About Summary</Label>
            <Textarea
              id="aboutSummary"
              {...form.register('aboutSummary')}
              rows={6}
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-secondary-blue hover:bg-blue-600"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}