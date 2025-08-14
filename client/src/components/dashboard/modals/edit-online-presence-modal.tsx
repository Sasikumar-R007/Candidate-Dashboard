import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useUpdateProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@shared/schema';

interface EditOnlinePresenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}

export default function EditOnlinePresenceModal({
  open,
  onOpenChange,
  profile
}: EditOnlinePresenceModalProps) {
  const updateProfile = useUpdateProfile();
  
  const form = useForm({
    defaultValues: {
      portfolioUrl: profile.portfolioUrl || '',
      websiteUrl: profile.websiteUrl || '',
      linkedinUrl: profile.linkedinUrl || '',
    }
  });

  const { toast } = useToast();

  const onSubmit = async (data: any) => {
    try {
      await updateProfile.mutateAsync(data);
      toast({
        title: "Online Presence Updated",
        description: "Your online presence information has been updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update online presence:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update online presence. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Online Presence</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="portfolioUrl">Portfolio 1</Label>
            <Input
              id="portfolioUrl"
              {...form.register('portfolioUrl')}
              placeholder="https://yourportfolio.com"
            />
          </div>
          
          <div>
            <Label htmlFor="websiteUrl">Portfolio 2 (Optional)</Label>
            <Input
              id="websiteUrl"
              {...form.register('websiteUrl')}
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn</Label>
            <Input
              id="linkedinUrl"
              {...form.register('linkedinUrl')}
              placeholder="https://linkedin.com/in/yourprofile"
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
              className="bg-blue-600 text-white hover:bg-blue-700 rounded"
              disabled={updateProfile.isPending || !form.formState.isDirty}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}